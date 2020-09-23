import React, { useState, useEffect } from "react";
import Layout from "./Layout";
import Card from "./Card";
import { getCategories, getFilteredProducts } from "./apiCore";
import Checkbox from "./Checkbox";
import RadioBox from "./RadioBox";
import { prices } from "./fixedPrices";
// import {sortFilters} from "sortFilters";

const Shop = () => {
    const [myFilters, setMyFilters] = useState({
        filters: { category: [], price: [] }
    });
    const [categories, setCategories] = useState([]);
    const [error, setError] = useState(false);
    const [limit, setLimit] = useState(6);
    const [skip, setSkip] = useState(0);
    const [size, setSize] = useState(0);
    const [filteredResults, setFilteredResults] = useState([]);
    const [value, setValue] = useState(0);

    const init = () => {
        getCategories().then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setCategories(data);
            }
        });
    };

    const loadFilteredResults = newFilters => {
        // console.log(newFilters);
        getFilteredProducts(skip, limit, newFilters).then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setFilteredResults(data.data);
                setSize(data.size);
                setSkip(0);
            }
        });
    };

    const loadMore = () => {
        let toSkip = skip + limit;
        // console.log(newFilters);
        getFilteredProducts(toSkip, limit, myFilters.filters).then(data => {
            if (data.error) {
                setError(data.error);
            } else {
                setFilteredResults([...filteredResults, ...data.data]);
                setSize(data.size);
                setSkip(toSkip);
            }
        });
    };

    const loadMoreButton = () => {
        return (
            size > 0 &&
            size >= limit && (
                <button onClick={loadMore} className="btn btn-warning mb-5">
                    Load more
                </button>
            )
        );
    };

    useEffect(() => {
        init();
        loadFilteredResults(skip, limit, myFilters.filters);
    }, []);

    const handleFilters = (filters, filterBy) => {
        // console.log("SHOP", filters, filterBy);
        const newFilters = { ...myFilters };
        newFilters.filters[filterBy] = filters;
        if (filterBy === "price") {
            let priceValues = handlePrice(filters);
            newFilters.filters[filterBy] = priceValues;
        }
        loadFilteredResults(myFilters.filters);
        setMyFilters(newFilters);
    };
    
    const handlePrice = value => {
        const data = prices;
        let array = [];
        for (let key in data) {
            if (data[key]._id === parseInt(value)) {
                array = data[key].array;
            }
        }
        return array;
    };

    const handleSortChange = event => {
        let result=[];
        if(event.target.value==='atoz' || event.target.value==='ztoa'){
            result=handleLexSort(event.target.value);
        }else if(event.target.value==='htol' || event.target.value==='ltoh'){
            result=handlePriceSort(event.target.value);
        }
        setFilteredResults(result);
        setSize(result);
        setSkip(0);
        setValue(event.target.value);
    };

    const handleLexSort = (order) =>{
        const result=[...filteredResults];
        result.sort(compare);
        if(order==='ztoa'){
            return result.reverse();
        }
        return result;
    }
    const handlePriceSort = (order) =>{
        const result=[...filteredResults];
        result.sort(comparePrice);
        if(order==='htol'){
            return result.reverse();
        }
        return result
    }

    function compare(a, b) {
        // Use toUpperCase() to ignore character casing
        const bookA = a.name.toUpperCase();
        const bookB = b.name.toUpperCase();

        let comparison = 0;
        if (bookA > bookB) {
          comparison = 1;
        } else if (bookA < bookB) {
          comparison = -1;
        }
        return comparison;
      }
    function comparePrice(a, b) {
        // Use toUpperCase() to ignore character casing
        const bookA = a.price;
        const bookB = b.price;

        let comparison = 0;
        if (bookA > bookB) {
          comparison = 1;
        } else if (bookA < bookB) {
          comparison = -1;
        }
        return comparison;
      }

    
    return (
        <Layout
            title="Shop Page"
            description="Search and find books of your choice"
            className="container-fluid"
        >
            <div className="row">
                <div className="col-3">
                    <h4>Filter by categories</h4>
                    <ul>
                        <Checkbox
                            categories={categories}
                            handleFilters={filters =>
                                handleFilters(filters, "category")
                            }
                        />
                    </ul>

                    <h4>Filter by price range</h4>
                    <div>
                        <RadioBox
                            prices={prices}
                            handleFilters={filters =>
                                handleFilters(filters, "price")
                            }
                        />
                    </div>
                    
                    <h4>Sort By:</h4>
                    <div>
                        <div>
                        <input
                            onChange={handleSortChange}
                            type="radio"
                            value="atoz"
                            name="sortFilter"
                            className="mr-2 ml-4"
                        />
                        <label className="form-check-label">A-Z</label>
                        </div>
                        <div>
                        <input
                            onChange={handleSortChange}
                            type="radio"
                            value="ztoa"
                            name="sortFilter"
                            className="mr-2 ml-4"
                        />
                        <label className="form-check-label">Z-A</label>
                        </div>
                        <div>
                        <input
                            onChange={handleSortChange}
                            type="radio"
                            value="htol"
                            name="sortFilter"
                            className="mr-2 ml-4"
                        />
                        <label className="form-check-label">$: High to Low</label>
                        </div>
                        <div>
                        <input
                            onChange={handleSortChange}
                            type="radio"
                            value="ltoh"
                            name="sortFilter"
                            className="mr-2 ml-4"
                        />
                        <label className="form-check-label">$: Low To High</label>
                        </div>
                    </div>
                </div>

                <div className="col-8">
                    <h2 className="mb-4">Products</h2>
                    <div className="row">
                        {filteredResults.map((product, i) => (
                            <div key={i} className="col-4 mb-3">
                                <Card product={product} />
                            </div>
                        ))}
                    </div>
                    <hr />
                    {loadMoreButton()}
                </div>
            </div>
        </Layout>
    );
};

export default Shop;
