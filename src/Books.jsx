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
        addingBook : false 
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
                return { ...state, currentBookEdit: null, currentBookView: null, addingBook : false  }; 
            case 'UPDATE_BOOK':
                return {
                    ...state,
                    books: state.books.map(book =>
                        book.id === action.payload.id ? action.payload : book
                    ),
                    currentBookEdit: null 
                };
            case 'TOGGLE_ADD_BOOK':
                return { ...state, addingBook: !state.addingBook };
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

    useEffect(() => {
        const fetchBooks = async () => {
            try {
                const response = await axios.get('http://localhost:8000/books');
                dispatch({ type: 'FETCH_SUCCESS', payload: response.data });
            } catch (error) {
                dispatch({ type: 'FETCH_ERROR', payload: error.message });
            }
        };

        fetchBooks();
    }, []);

    const viewBook = (book) => {
        dispatch({ type: 'VIEW_BOOK', payload: book });
        state.currentBookEdit = null; 
        state.addingBook=  false 
    };

    const editBook = (book) => {
        console.log("Editing book:", book); 
        dispatch({ type: 'EDIT_BOOK', payload: book });
        state.currentBookView = null; 
        state.addingBook = false 
    };

    const saveBook = async () => {
        const updatedBook = {
            id: state.currentBookEdit.id,
            title: titleRef.current.value,
            author: authorRef.current.value,
            genre: genreRef.current.value,
            publication_year: publicationYearRef.current.value,
            description: descriptionRef.current.value,
            cover_image : imageRef.current.value
        };

        try {
            const response = await axios.put(`http://localhost:8000/books/${updatedBook.id}`, updatedBook);
            dispatch({ type: 'UPDATE_BOOK', payload: response.data });
        } catch (error) {
            console.error("Failed to update book:", error);
        }
    };

    const deleteBook = async (id) => {
        console.log("Attempting to delete book with ID:", id); 
        try {
            await axios.delete(`http://localhost:8000/books/${id}`);
            dispatch({ type: 'DELETE_BOOK', payload: id });
        } catch (error) {
            console.error("Failed to delete book:", error.response ? error.response.data : error.message);
        }
    };

    const addBook = async () => {
        const newBook = {
            title: titleRef.current.value,
            author: authorRef.current.value,
            genre: genreRef.current.value,
            publication_year: publicationYearRef.current.value,
            description: descriptionRef.current.value,
            cover_image: imageRef.current.value
        };
        state.currentBookEdit = null;
        state.currentBookView = null;

        try {
            const response = await axios.post('http://localhost:8000/books', newBook);
            dispatch({ type: 'FETCH_SUCCESS', payload: [...state.books, response.data] });
            dispatch({ type: 'TOGGLE_ADD_BOOK' }); 
            
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
            </div>
            
            

            <div className="view text-center w-25">
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
                                <input type="text" className="form-control" ref={imageRef} />
                            </div>
                            <button type="button" className="btn btn-primary" onClick={addBook}>
                                Add Book
                            </button>
                            <button type="button" className="btn btn-secondary ms-2" onClick={() => dispatch({ type: 'CLEAR_CURRENT_BOOK' })}>
                                Cancel
                            </button>
                        </form>
                    )}

                {state.currentBookView  && (
                    <div className='card m-5'>
                        <h3 className='card-title'>{state.currentBookView.title}</h3>
                        <img className='card-img-top px-5' style={{ height: '300px' }} src={state.currentBookView.cover_image} alt="Cover" />
                        <div className="card-body">
                            <p className='card-text'><strong>Publication Year: </strong>{state.currentBookView.publication_year}</p>
                            <p className='card-text'><strong>Author: </strong>{state.currentBookView.author}</p>
                            <p className='card-text'><strong>Genre: </strong>{state.currentBookView.genre}</p>
                            <p className='card-text'><strong>Description: </strong>{state.currentBookView.description}</p>
                        </div>
                    </div>
                )}

                {state.currentBookEdit && (
                    <form className="container">
                        <div className="mb-3">
                            <label className="form-label">Title</label>
                            <input
                                type="text"
                                name="title"
                                className="form-control"
                                defaultValue={state.currentBookEdit.title}
                                ref={titleRef}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Author</label>
                            <input
                                type="text"
                                name="author"
                                className="form-control"
                                defaultValue={state.currentBookEdit.author}
                                ref={authorRef}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Publication Year</label>
                            <input
                                type="text"
                                name="publication_year"
                                className="form-control"
                                defaultValue={state.currentBookEdit.publication_year}
                                ref={publicationYearRef}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Genre</label>
                            <input
                                type="text"
                                name="genre"
                                className="form-control"
                                defaultValue={state.currentBookEdit.genre}
                                ref={genreRef}
                            />
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Description</label>
                            <textarea
                                className="form-control"
                                rows="3"
                                defaultValue={state.currentBookEdit.description}
                                ref={descriptionRef}
                            ></textarea>
                        </div>
                        <div className="mb-3">
                            <label className="form-label">Image</label>
                            <input
                                type="text"
                                name="img"
                                className="form-control"
                                defaultValue={state.currentBookEdit.cover_image}
                                ref={imageRef}
                            />
                        </div>
                        <button type="button" className="btn btn-primary" onClick={saveBook}>
                            Save Changes
                        </button>
                        <button type="button" className="btn btn-secondary ms-2" onClick={() => dispatch({ type: 'CLEAR_CURRENT_BOOK' })}>
                            Cancel
                        </button>
                    </form>
                )}
            </div>
        </div>
    );
};

export default Books;
