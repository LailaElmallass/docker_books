import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.css'
import App from './App'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
import React, { useReducer, useEffect, useRef } from 'react';
import axios from 'axios';
import { FaEye } from "react-icons/fa";
import { IoPencilSharp } from "react-icons/io5";
import { TiDelete } from "react-icons/ti";

const Books = () => {
    const initialState = {
        books: [],
        loading: true,
        error: null,
        currentBookView: null,
        currentBookEdit: null,
        addingBook: false // New state to control the visibility of the add book form
    };

    function reducer(state, action) {
        switch (action.type) {
            case 'FETCH_SUCCESS':
                return { ...state, loading: false, books: action.payload };
            case 'FETCH_ERROR':
                return { ...state, loading: false, error: action.payload };
            case 'VIEW_BOOK':
                return { ...state, currentBookView: action.payload };
            case 'EDIT_BOOK':
                return { ...state, currentBookEdit: action.payload }; 
            case 'DELETE_BOOK':
                return {
                    ...state,
                    books: state.books.filter(book => book.id !== action.payload),
                };
            case 'CLEAR_CURRENT_BOOK':
                return { ...state, currentBookEdit: null, currentBookView: null, addingBook: false }; 
            case 'UPDATE_BOOK':
                return {
                    ...state,
                    books: state.books.map(book =>
                        book.id === action.payload.id ? action.payload : book
                    ),
                    currentBookEdit: null // Clear edit state after updating
                };
            case 'TOGGLE_ADD_BOOK':
                return { ...state, addingBook: !state.addingBook }; // Toggle add book form
            default:
                return state;
        }
    }

    const [state, dispatch] = useReducer(reducer, initialState);
    const titleRef = useRef(null);
    const authorRef = useRef(null);
    const genreRef = useRef(null);
    const publicationYearRef = useRef(null);
    const descriptionRef = useRef(null);
    const imageRef = useRef(null);

    // Fetch books function remains the same...

    const addBook = async () => {
        const newBook = {
            title: titleRef.current.value,
            author: authorRef.current.value,
            genre: genreRef.current.value,
            publication_year: publicationYearRef.current.value,
            description: descriptionRef.current.value,
            cover_image: imageRef.current.files[0] // Use a file input for the cover image
        };

        try {
            const response = await axios.post('http://localhost:8000/books', newBook);
            dispatch({ type: 'FETCH_SUCCESS', payload: [...state.books, response.data] });
            dispatch({ type: 'TOGGLE_ADD_BOOK' }); // Hide the form after adding
        } catch (error) {
            console.error("Failed to add book:", error);
        }
    };

    return (
        <div className='d-flex justify-content-around'>
            <div className="table-responsive w-75">
                <button className="btn btn-primary mb-3" onClick={() => dispatch({ type: 'TOGGLE_ADD_BOOK' })}>
                    Add Book
                </button>
                <table className="table table-light table-striped">
                    <thead>
                        <tr>
                            <th scope="col">ID</th>
                            <th scope="col">Title</th>
                            <th scope="col">Author</th>
                            <th scope="col">Publication Year</th>
                            <th scope="col">Genre</th>
                            <th scope="col">Image</th>
                            <th scope="col">Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {state.loading ? (
                            <tr>
                                <td colSpan="7">Loading...</td>
                            </tr>
                        ) : state.error ? (
                            <tr>
                                <td colSpan="7">Error: {state.error}</td>
                            </tr>
                        ) : (
                            state.books.map(book => (
                                <tr key={book.id}>
                                    <td>{book.id}</td>
                                    <td>{book.title}</td>
                                    <td>{book.author}</td>
                                    <td>{book.publication_year}</td>
                                    <td>{book.genre}</td>
                                    <td><img src={book.cover_image} style={{ width: '100px' }} alt="Cover" /></td>
                                    <td>
                                        <FaEye onClick={() => viewBook(book)} />
                                        <IoPencilSharp onClick={() => editBook(book)} />
                                        <TiDelete onClick={() => deleteBook(book.id)} />
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
                
                {/* Add Book Form */}
                {state.addingBook && (
                    <form className="container mt-3">
                        <h4>Add New Book</h4>
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input type="text" className="form-control" ref={titleRef} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Author</label>
                            <input type="text" className="form-control" ref={authorRef} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Publication Year</label>
                            <input type="text" className="form-control" ref={publicationYearRef} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Genre</label>
                            <input type="text" className="form-control" ref={genreRef} />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea className="form-control" rows="3" ref={descriptionRef}></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Image</label>
                            <input type="file" className="form-control" ref={imageRef} />
                        </div>
                        <button type="button" className="btn btn-primary" onClick={addBook}>
                            Add Book
                        </button>
                        <button type="button" className="btn btn-secondary ms-2" onClick={() => dispatch({ type: 'CLEAR_CURRENT_BOOK' })}>
                            Cancel
                        </button>
                    </form>
                )}
            </div>
            
            {/* View and Edit logic remains the same... */}
        </div>
    );
};

export default Books;
