import { Component, OnInit } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { MediaCapture, CaptureVideoOptions } from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/file/ngx';
import { Validators, FormBuilder, FormGroup, ValidatorFn, ValidationErrors } from '@angular/forms';
import { firebaseErrors } from 'src/assets/scripts/errores';
import { ComplementosService } from 'src/app/servicios/complementos.service'
import { PartidosService } from 'src/app/servicios/partidos.service'

@Component({
	selector: 'app-alta-partido',
	templateUrl: './alta-partido.component.html',
	styleUrls: ['./alta-partido.component.scss'],
})
export class AltaPartidoComponent implements OnInit {
	public splash = false;
	public fechaValorActual: string;
	public fechaValorMinimo: string;
	public fechaValorMaximo: string;
	public localR: number = 0;
	public visitanteR: number = 0;
	public form: FormGroup = this.formBuilder.group({
		fecha: [null, [Validators.required]],
		local: [null, [Validators.required, Validators.pattern('^[a-zA-ZñÑ0-9 ]{3,25}$')]],
		visitante: [null, [Validators.required, Validators.pattern('^[a-zA-ZñÑ0-9 ]{3,25}$')]],
		resultado: [null, [Validators.required]],
		foto: [null],
		video: [null]
	});
	public validation_messages = {
		'fecha': [
			{ type: 'required', message: 'La fecha es requerida.' },
		],
		'local': [
			{ type: 'required', message: 'El equipo Local es requerido.' },
			{ type: 'pattern', message: 'El nombre del local no debe tener entre 3 y 25 caracteres sin simbolos.' }
		],
		'visitante': [
			{ type: 'required', message: 'El equipo Visitante es requerido.' },
			{ type: 'pattern', message: 'El nombre del local no debe tener entre 3 y 25 caracteres sin simbolos.' }
		],
		'resultado': [
			{ type: 'required', message: 'El Resultado es requerido.' },
			{ type: 'resultadoInvalido', message: 'El resultado no puede tener valores menores a 0.' },
		],
		'video': [
			{ type: 'required', message: 'La contraseña es requerida.' },
			{ type: 'pattern', message: 'La contraseña debe tener entre 6 y 18 caracteres.' }
		],
		'foto': [
			{ type: 'required', message: 'La foto es requerida.' },
		]
	};

	constructor(private formBuilder: FormBuilder, private camera: Camera, private comp: ComplementosService,
		private media: MediaCapture, private file: File, private partidos: PartidosService) { }


	ngOnInit() {
		setInterval(() => {
			let d = new Date();
			this.fechaValorMaximo = new Date(d.getTime() - (d.getTimezoneOffset() * 60000)).toISOString();
		}, 1000);
		this.localR = 0;
		this.visitanteR = 0;
		this.result();
	}

	Ifecha($event) {
		let fecha = new Date($event.detail.value);
		this.fechaValorActual = fecha.toISOString();
		this.form.controls.fecha.setValue(fecha.getTime());
	}

	result() {
		this.form.controls.resultado.setValue(this.localR + ' - ' + this.visitanteR);
		if (this.localR < 0 || this.visitanteR < 0) {
			this.form.controls.resultado.setErrors({ 'resultadoInvalido': true });
		} else if (this.localR === null || this.visitanteR === null) {
			this.form.controls.resultado.setErrors({ 'required': true });
		}
		else {
			this.form.controls.resultado.setErrors(null);
		}
		console.log(this.form);
	}


	tomarFotografia() {
		const options: CameraOptions = {
			quality: 100,
			targetHeight: 600,
			targetWidth: 600,
			destinationType: this.camera.DestinationType.DATA_URL,
			encodingType: this.camera.EncodingType.JPEG,
			mediaType: this.camera.MediaType.PICTURE,
			correctOrientation: true
		}
		this.camera.getPicture(options).then((imageData) => {
			var base64Str = 'data:image/jpeg;base64,' + imageData;
			this.form.controls.foto.setValue(base64Str);
		});
	}

	tomarVideo() {
		this.splash = true;
		let ops: CaptureVideoOptions = { duration: 15 };
		this.media.captureVideo(ops).then(videoData => {
			var fullPath = videoData[0].fullPath;
			var directoryPath = fullPath.substr(0, fullPath.lastIndexOf('/')); // URL to directory without filename
			var fileName = fullPath.substr(fullPath.lastIndexOf('/') + 1); // filename with extension
			return this.file.readAsDataURL(directoryPath, fileName);
		}).then((dataURL) => {
			this.form.controls.video.setValue(dataURL);
			this.comp.presentToastConMensajeYColor('se pudo convertir el archivo.', 'primary');
		}).catch(err => {
			this.comp.presentToastConMensajeYColor('no se pudo convertir el archivo. ' + err, 'danger');
		}).finally(() => this.splash = false);

	}

	async cargarPartido() {
		this.splash = true;
		let data: any = {
			fecha: this.form.value.fecha,
			local: this.form.value.local,
			visitante: this.form.value.visitante,
			resultado: this.form.value.resultado,
			foto: this.form.value.foto,
			video: this.form.value.video,
		}
		if (this.form.valid) {
			if (data.video !== null) {
				await this.partidos.subirVideo('partidoMetegol/partidos/' + data.local + '-' + data.visitante + '_' + data.fecha + '.mp4', data.video).then(url => {
					data.video = url;
				}).catch(err => this.comp.presentToastConMensajeYColor(firebaseErrors(err), 'danger'));
			}
			if (data.foto !== null) {
				await this.partidos.subirImagen('partidoMetegol/partidos/' + data.local + '-' + data.visitante + '_' + data.fecha + '.jpg', data.foto).then(url => {
					data.foto = url;
				}).catch(err => this.comp.presentToastConMensajeYColor(firebaseErrors(err), 'danger'));
			}
			await this.partidos.crearPartido(data).then(r => {
				this.comp.presentToastConMensajeYColor('Partido Cargado con exito', 'success');
			}).catch(err => this.comp.presentToastConMensajeYColor(firebaseErrors(err), 'danger'));
			let ganador: string = null;
			if (this.localR > this.visitanteR) {
				ganador = data.local
			} else if (this.localR < this.visitanteR) {
				ganador = data.visitante;
			}
			if (ganador !== null) {
				let aux: Array<any> = [];
				await this.partidos.traerEquipos().then(e => {
					aux = e.docs.map(refDoc => {
						const x: any = refDoc.data() as any;
						x['id'] = refDoc.id;
						return { ...x };
					});
				}).catch(err => this.comp.presentToastConMensajeYColor(firebaseErrors(err), 'danger'));
				let indGan = aux.findIndex(x => x.nombre === ganador)
				if (indGan !== -1) {
					aux[indGan].pGanados++;
					await this.partidos.actualizarEquipo(aux[indGan]).catch(err => this.comp.presentToastConMensajeYColor(firebaseErrors(err), 'danger'));
				} else {
					await this.partidos.guardarEquipo({ nombre: ganador, pGanados: 1 }).catch(err => this.comp.presentToastConMensajeYColor(firebaseErrors(err), 'danger'));
				}
			}
			this.splash = false;
		}
	}

	limpiarCampos() {
		this.form.reset();
		this.localR = 0;
		this.visitanteR = 0;
	}
}
