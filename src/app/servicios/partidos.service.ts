import { Injectable } from '@angular/core';
import { AngularFireStorage } from '@angular/fire/storage'
import { AngularFirestore } from '@angular/fire/firestore'

@Injectable({
  providedIn: 'root'
})
export class PartidosService {

  constructor(private firestore: AngularFirestore, private storage: AngularFireStorage) { }

  traerTodos() {
    return this.firestore.collection('partidoMetegol').doc('subcolecciones').collection('partidos', ref => ref.orderBy('fecha', 'desc')).snapshotChanges();
  }

  public crearConId(data: any, id: string) {
    return this.firestore.collection('partidoMetegol').doc('subcolecciones').collection('partidos').doc(id).set(data).then(() => { return id });
  }

  public crearPartido(data){
    return this.firestore.collection('partidoMetegol').doc('subcolecciones').collection('partidos').add(data).then(data => data.id);
  }

  public subirImagen(ruta: string, data: any) {
    return this.storage.ref(ruta).putString(data, 'data_url').then(data => {
      return data.ref.getDownloadURL().then(x => x);
    });
  }

  public subirVideo(ruta: string, data: any) {
    return this.storage.ref(ruta).putString(data, 'data_url', { contentType: 'video/mp4' }).then(data => {
      return data.ref.getDownloadURL().then(x => x);
    });
  }
}
