import { Component, OnInit, OnDestroy } from '@angular/core';
import { Camera, CameraOptions } from '@ionic-native/camera/ngx';
import { MediaCapture, CaptureVideoOptions } from '@ionic-native/media-capture/ngx';
import { File } from '@ionic-native/file/ngx';
import { firebaseErrors } from 'src/assets/scripts/errores';
import { ComplementosService } from 'src/app/servicios/complementos.service'
import { PartidosService } from 'src/app/servicios/partidos.service'

@Component({
	selector: 'app-seccion-ganadores',
	templateUrl: './seccion-ganadores.component.html',
	styleUrls: ['./seccion-ganadores.component.scss'],
})
export class SeccionGanadoresComponent implements OnInit {
	public splash = false;
	public listaEquipos: Array<any> = [];
	public sub: any = null;
	constructor(private comp: ComplementosService, private partidos: PartidosService) { }

	ngOnInit() {
		this.sub = this.partidos.traerEquiposGanadores().subscribe(refData =>{
			this.listaEquipos = refData.map(refDoc =>{
				const x: any = refDoc.payload.doc.data();
				x['id'] = refDoc.payload.doc.id;
				return {...x};
			}).slice(0,5);
		})
	}

	ionwillLeaveView(){
		this.sub.unsubscribe();
	}

	
}
