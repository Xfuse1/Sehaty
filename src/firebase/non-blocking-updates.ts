'use client';
import {
  doc,
  setDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  DocumentReference,
  CollectionReference,
  SetOptions,
  WithFieldValue,
  Firestore,
} from 'firebase/firestore';
import { errorEmitter } from './error-emitter';
import { FirestorePermissionError } from './errors';

/**
 * Performs a non-blocking set operation on a document.
 * It does not wait for the operation to complete and handles errors in the background.
 * @param docRef The DocumentReference to set.
 * @param data The data to write.
 * @param options Set options.
 */
export function setDocumentNonBlocking<T>(
  docRef: DocumentReference<T>,
  data: WithFieldValue<T>,
  options?: SetOptions
): void {
  const operation = options && 'merge' in options ? 'update' : 'create';
  setDoc(docRef, data, options || {})
    .catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: operation,
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Performs a non-blocking add operation to a collection.
 * @param collectionRef The CollectionReference to add to.
 * @param data The data to add.
 */
export function addDocumentNonBlocking<T>(
  collectionRef: CollectionReference<T>,
  data: WithFieldValue<T>
): void {
  addDoc(collectionRef, data)
    .catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: collectionRef.path,
        operation: 'create',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}


/**
 * Performs a non-blocking update operation on a document.
 * @param docRef The DocumentReference to update.
 * @param data The data to update.
 */
export function updateDocumentNonBlocking<T>(
  docRef: DocumentReference<T>,
  data: Partial<WithFieldValue<T>>
): void {
  // Firestore's updateDoc is for partial updates, so we cast data.
  // The 'update' operation type is appropriate.
  updateDoc(docRef, data)
    .catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'update',
        requestResourceData: data,
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}

/**
 * Performs a non-blocking delete operation on a document.
 * @param docRef The DocumentReference to delete.
 */
export function deleteDocumentNonBlocking(docRef: DocumentReference): void {
  deleteDoc(docRef)
    .catch((serverError) => {
      const permissionError = new FirestorePermissionError({
        path: docRef.path,
        operation: 'delete',
      });
      errorEmitter.emit('permission-error', permissionError);
    });
}
