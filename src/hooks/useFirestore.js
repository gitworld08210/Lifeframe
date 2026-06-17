import { useState, useEffect } from 'react';
import { collection, doc, onSnapshot, query } from 'firebase/firestore';
import { db } from '../firebase';

export function useCollection(collectionPath, queryConstraints = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionPath) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    let ref;
    try {
      const colRef = collection(db, ...collectionPath.split('/'));
      ref = queryConstraints.length > 0 ? query(colRef, ...queryConstraints) : colRef;
    } catch (err) { setError(err); setLoading(false); return; }

    const unsubscribe = onSnapshot(ref,
      (snapshot) => {
        setData(snapshot.docs.map((d) => ({ id: d.id, ...d.data() })));
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return () => unsubscribe();
  }, [collectionPath, JSON.stringify(queryConstraints.map(c => c.toString()))]);

  return { data, loading, error };
}

export function useDocument(docPath) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!docPath) { setLoading(false); return; }
    setLoading(true);
    setError(null);

    const segments = docPath.split('/');
    const docRef = doc(db, ...segments);

    const unsubscribe = onSnapshot(docRef,
      (docSnap) => {
        setData(docSnap.exists() ? { id: docSnap.id, ...docSnap.data() } : null);
        setLoading(false);
      },
      (err) => { setError(err); setLoading(false); }
    );
    return () => unsubscribe();
  }, [docPath]);

  return { data, loading, error };
}
