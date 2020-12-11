import { Component, OnDestroy } from '@angular/core';
import { Router } from "@angular/router";
import { AuthService } from '../servicios/auth/auth.service';
import { ComplementosService } from 'src/app/servicios/complementos.service';
import { VideoPlayer } from '@ionic-native/video-player/ngx';
import { firebaseErrors } from 'src/assets/scripts/errores';
import { PartidosService } from 'src/app/servicios/partidos.service'

@Component({
	selector: 'app-home',
	templateUrl: 'home.page.html',
	styleUrls: ['home.page.scss'],
})
export class HomePage implements OnDestroy {
	public usuario: any = null;
	public subU: any = null;
	public sub: any = null;
	public listaPartidos: Array<any> = [];

	constructor(private router: Router, private auth: AuthService, private comp: ComplementosService, private videoP: VideoPlayer, private partidos: PartidosService) {
		console.log('accede a usuario');
		this.subU = this.auth.usuario.subscribe(user => {
			if (user !== null) {
				this.usuario = user.email;
				console.log(this.usuario);
				this.sub = this.partidos.traerTodos().subscribe(snap => {
					this.listaPartidos = snap.map(ref =>{
						const x: any = ref.payload.doc.data() as any;
						x['id'] = ref.payload.doc.id;
						return {...x};
					})
				})
			}
		});
	}

	verVideo(video){
		let x = this.videoP.play(video).catch(err => {
			//this.comp.presentToastConMensajeYColor(firebaseErrors(err),'danger')
		}).finally(()=> this.videoP.close());
	}

	public cerrarSesion() {
		this.auth.logout().then(() => {
			this.comp.playAudio('error');
			this.router.navigate([''])
		});
	}

	public ngOnDestroy(): void {
		if (this.subU !== null) {
			this.subU.unsubscribe();
		}
	}

}
