import React, { useEffect } from 'react'

import Layout from '../components/layout'
import SEO from '../components/seo'
import { useBooks } from '../providers/books'
let firestore
const getFirestore = firebase => {
  const firebaseConfig = {
    apiKey: 'AIzaSyD7fLrkkpK1591-lOsjhcgzHH8EQASt1Hw',
    authDomain: 'personal-blog-db3ea.firebaseapp.com',
    databaseURL: 'https://personal-blog-db3ea.firebaseio.com',
    projectId: 'personal-blog-db3ea',
    storageBucket: '',
    messagingSenderId: '456701325008',
    appId: '1:456701325008:web:a6345ca3d9e4d561',
  }
  // Initialize Firebase
  if (firestore) {
    return firestore
  } else {
    firebase.initializeApp(firebaseConfig)
    firestore = firebase.firestore()
    return firestore
  }
}
export default function({ location }) {
  const { books, setBooks } = useBooks()
  const [loading, setLoading] = React.useState(!books.length)

  useEffect(() => {
    async function getBooks() {
      if (!books.length) {
        setLoading(true)
        const lazyFirebase = import('firebase/app')
        const lazyFirestore = import('firebase/firestore')
        const [firebase] = await Promise.all([lazyFirebase, lazyFirestore])
        const result = []
        const booksResponse = await getFirestore(firebase)
          .collection('reading')
          .get()
        booksResponse.docs.forEach(doc => {
          result.push({
            id: doc.id,
            ...doc.data(),
          })
        })
        setBooks(result)
        setLoading(false)
      }
    }
    getBooks()
  }, [])

  return (
    <Layout location={location} title={'michaelhelvey.dev'}>
      <SEO title={'Reading'} />
      <div className='md:pt-12 pt-6 font-sans container mx-auto px-4 flex flex-col items-start'>
        <h1 className='text-2xl font-black leading-normal text-green-700 font-sans'>
          Reading
        </h1>
        <div className='w-full border-gray-300 py-4'>
          <div className='max-w-2xl text-base leading-normal font-sans'>
            I consistently waste time. How can I understand what I am to do in
            the world to improve it, if I cannot understand myself, or the
            world, or the God who created it? In repentence of this, starting in
            August of 2019 I am attempting to begin once again to read the Great
            Books. This represents a clear difference from what I have done for
            the last several years, which is to restrict my reading to what
            interests me, to what I must read to complete my college studies, or
            to what aids in frivolously passing the time on the internet.
            Instead, I will consciously devote my reading time to works that I
            believe will aid my understanding of myself, of God, and what I am
            to do here in the world.
          </div>
        </div>
        <h2 className='text-xl font-black leading-normal text-gray-700 font-sans p-0 mt-6'>
          On the Nightstand
        </h2>
        <BooksList
          books={books
            .filter(b => !b.completed)
            .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())}
          loading={loading}
        />
        <h2 className='text-xl font-black leading-normal text-gray-700 font-sans p-0 mt-2'>
          Completed
        </h2>
        <BooksList
          books={books
            .filter(b => !!b.completed)
            .sort((a, b) => b.timestamp.toDate() - a.timestamp.toDate())}
          loading={loading}
        />
      </div>
    </Layout>
  )
}

function BooksList({ books, loading }) {
  return (
    <ul className='px-2 font-sans w-full'>
      {loading ? (
        <div className='my-3'>Loading Books...</div>
      ) : (
        books.map(book => (
          <li
            key={book.id}
            className='my-4 pb-2 border-b border-gray-300 bg-white w-full'
          >
            <h3 className='font-bold text-black text-lg font-sans p-0 my-1'>
              {book.title}{' '}
              <span className='text-base text-gray-500'>
                - {book.pages} pages
              </span>
            </h3>
            <div className='text-black text-base my-1'>by {book.author}</div>
            <div className='text-sm text-gray-700'>
              {book.timestamp.toDate().toLocaleDateString()}
            </div>
            <div className='text-gray-900 my-2 max-w-xl'>{book.notes}</div>
          </li>
        ))
      )}
    </ul>
  )
}
