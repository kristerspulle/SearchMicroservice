import { useState } from 'react';
import './App.css';
import axios from 'axios';

type ProductData = {
  title: string;
  description: string;
  final_price: number;
};

const App = () => {
  const [searchQuery, setSearchQuery] = useState({ query: '', page: '' });
  const [productData, setProductData] = useState([]);

  const searchData = () => {
    axios
      .get('http://localhost:3000', {
        params: {
          query: searchQuery.query,
          page: searchQuery.page,
        },
      })
      .then((res) => {
        setProductData(res.data);
      })
      .catch((error: Error) => {
        console.error(error);
      });
  };

  return (
    <>
      <form
        className='form'
        onSubmit={(e) => {
          e.preventDefault();
          searchData();
        }}
      >
        <input
          className='input'
          type='text'
          placeholder='Search'
          required
          onChange={(e) => {
            setSearchQuery({
              ...searchQuery,
              query: e.target.value,
            });
          }}
        />
        <input
          className='input'
          type='text'
          placeholder='Page'
          required
          onChange={(e) => {
            setSearchQuery({
              ...searchQuery,
              page: e.target.value,
            });
          }}
        />
        <button className='button' type='submit'>
          Search
        </button>
      </form>
      {productData.length !== 0 ? (
        productData.map((product: ProductData) => (
          <div className='productWrapper' key={Math.random()}>
            <div className='title'>{product.title}</div>
            <div className='description'>{product.description}</div>
            <div className='price'>{product.final_price}</div>
          </div>
        ))
      ) : (
        <div className='noProducts'>No products found.</div>
      )}
    </>
  );
};

export default App;
