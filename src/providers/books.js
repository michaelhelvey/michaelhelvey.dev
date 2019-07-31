import React from 'react'

const BooksContext = React.createContext({})

export function BooksProvider({ children }) {
  const [books, setBooks] = React.useState([])

  return (
    <BooksContext.Provider value={{ books, setBooks }}>
      {children}
    </BooksContext.Provider>
  )
}

export function useBooks() {
  const context = React.useContext(BooksContext)
  if (!context.books) {
    // we're server side
    return {
      books: [],
      setBooks: () => {},
    }
  }
  return context
}
