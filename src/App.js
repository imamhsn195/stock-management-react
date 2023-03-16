import React, { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faArrowUpWideShort, faArrowDownShortWide } from "@fortawesome/free-solid-svg-icons";
import Pagination from 'react-bootstrap/Pagination';
import { Table,Card,Container,Row,Col,Form,Button } from "react-bootstrap";
import { useForm } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import Select from 'react-select';
import * as yup from "yup";
import axios from 'axios';
const api = `http://128.8.1.93:8888/api`;

const addressSchema = yup.object({
  street: yup.string().required("Street is required."),
  city: yup.string().required("City is required."),
  state: yup.string().required("State is required."),
  country: yup.string().required("Country is required."),
  zipCode: yup.string().required("Zip Code is required.")
});
 
const CustomerSchema = yup.object({
  name: yup.string().required(),
  email: yup.string().email("Email is not correct.").required("Email is required."),
  phone: yup.string().required(),
  address: addressSchema,
});
 
export default function App() {
  const [allCustomers, setAllCustomers] = useState([]);
  const [selectedAddress, setSelectedAddress] = useState({})
  const [addresses, setAddresses] = useState([]);
  const [activePage, setActivePage] = useState(1)
  const [sort, setSort] = useState('id');
  const [selectedOption, setSelectedOption] = useState(null);
  const options = addresses?.content?.map((address, index) => ({ value: address.id, label:address.street + address.city + address.state + address.county , key: `option-${index}`}));
  // options.push({value : 0, label: "Add New", key:`option-0`});
  const handleChange = (option) => {
    setSelectedAddress(option.value !== 0? addresses?.content?.filter(address => address.id === option.value)[0] : {});
    setSelectedOption(option);
    // console.log("Selected Address: ", selectedAddress)
  }
  const fetchAddresses = async () => {
    await axios.get(`${api}/addresses?pageNumber=0&pageSize=10&paginated=false&sortBy=id`)
      .then(response => {
        setAddresses(response.data)

      }); 
  }
  const fetchCustomers = async () => {
    await axios.get(`${api}/customers?pageNumber=${activePage-1}&pageSize=10&sortBy=${sort}`)
    .then(response =>{
      setAllCustomers(response.data)
    });
  };
  const onSubmit = async (customer) => {
    axios.post(`${api}/customers`, customer)
    .then(function (response) {
      console.log(response.data);
      reset()
      fetchCustomers();
    }).catch(function (error) { console.log(error);});
  };
  const { register, handleSubmit, reset, formState: { errors }, } = useForm({ mode: 'onBlur', resolver: yupResolver(CustomerSchema), });

  let totalPages = allCustomers.totalPages;
  let items = [
    <Pagination.First key={"prev"} disabled={allCustomers.first} onClick={() => setActivePage(activePage-1)}>Prev Page</Pagination.First>
  ];
  for (let number = 1; number <= totalPages; number++) {
    items.push(
      <Pagination.Item key={number} active={number === activePage} onClick={(e) => setActivePage(+e.target.text)}>
        {number}
      </Pagination.Item>,
    );
  }
  items.push(
    <Pagination.First key={'next'}  disabled={allCustomers.last}  onClick={() => setActivePage(activePage+1)}>Next Page</Pagination.First>
  );
  
  const paginationBasic = (
    <div>
      <Pagination className='float-end m-2'>
        {items}
      </Pagination>
    </div>
  );
  useEffect(() => { fetchCustomers() }, [activePage, sort])
  useEffect(() => { fetchAddresses() },[]);
  return (
    <Container>
      <Row>
        <Col>
          <h1>Customers</h1>
        </Col>
      </Row>
      <Row>
        <Col xs={12} md={4}>
          <Card>
            <Card.Header>Registration Form</Card.Header>
            <Form onSubmit={handleSubmit(onSubmit)}>
              <Form.Group className="mb-3" controlId="name">
                <Form.Control
                  type="name"
                  placeholder="Enter name"
                  {...register("name")}
                />
                {errors.name?.type === "required" && (
                  <p role="alert" className="text-danger">
                    {errors.name.message}
                  </p>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="email">
                <Form.Control
                  placeholder="Enter email"
                  {...register("email")}
                />
                {errors.email?.type === "required" && (
                  <p role="alert" className="text-danger">
                    {errors.email.message}
                  </p>
                )}
                {errors.email?.type === "email" && (
                  <p role="alert" className="text-danger">
                    {errors.email.message}
                  </p>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="phone">
                <Form.Control
                  type="phone"
                  placeholder="Enter phone"
                  name="phone"
                  {...register("phone")}
                />
                {errors.phone?.type === "required" && (
                  <p role="alert" className="text-danger">
                    {errors.phone.message}
                  </p>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="address">
                <Select
                  options={options}
                  value={selectedOption}
                  onChange={handleChange}
                  isSearchable
                />
              </Form.Group>
              <Form.Group className="mb-3" controlId="street">
                <Form.Control
                  type="text"
                  placeholder="Enter street"
                  {...register("address.street")}
                  value={ selectedAddress?.street }
                />
                {errors.address?.street?.type === "required" && (
                  <p role="alert" className="text-danger">
                    {errors.address?.street.message}
                  </p>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="city">
                <Form.Control
                  type="text"
                  placeholder="Enter city"
                  {...register("address.city")}
                  value={ selectedAddress?.city }
                />
                {errors.address?.city?.type === "required" && (
                  <p role="alert" className="text-danger">
                    {errors.address?.city.message}
                  </p>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="state">
                <Form.Control
                  type="text"
                  placeholder="Enter State"
                  {...register("address.state")}
                  value={ selectedAddress?.state }
                />
                {errors.address?.state?.type === "required" && (
                  <p role="alert" className="text-danger">
                    {errors.address?.state.message}
                  </p>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="country">
                <Form.Control
                  type="text"
                  placeholder="Enter country"
                  {...register("address.country")}
                  value={ selectedAddress?.country }
                />
                {errors.address?.country?.type === "required" && (
                  <p role="alert" className="text-danger">
                    {errors.address?.country.message}
                  </p>
                )}
              </Form.Group>
              <Form.Group className="mb-3" controlId="zipCode">
                <Form.Control
                  type="zipCode"
                  placeholder="Enter Zip Code"
                  {...register("address.zipCode")}
                  value={ selectedAddress?.zipCode }
                />
                {errors.address?.zipCode?.type === "required" && (
                  <p role="alert" className="text-danger">
                    {errors.address?.zipCode.message}
                  </p>
                )}
              </Form.Group>
              <Form.Group>
                <Button size="sm" variant="primary" type="submit">
                  Save
                </Button>
              </Form.Group>
            </Form>
          </Card>
        </Col>
        <Col xs={6} md={8}>
          <Card>
            <Card.Header>List</Card.Header>
            <Table hover bordered>
              <thead>
                <tr>
                  <th>#</th>
                  <th> Name
                    <a className="btn btn-link" onClick={() => setSort('name') }>
                      <FontAwesomeIcon icon={faArrowDownShortWide}/>
                    </a>
                  </th>
                  <th>Email 
                    <a className="btn btn-link" onClick={() => setSort('email') }>
                      <FontAwesomeIcon icon={faArrowUpWideShort}/>
                    </a>  
                  </th>
                  <th>Phone 
                  <a className="btn btn-link" onClick={() => setSort('phone') }>
                    <FontAwesomeIcon icon={faArrowUpWideShort}/>
                    </a>  
                  </th>
                  <th>Address</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {
                  allCustomers?.content?.map(customer => {
                    const {address} = customer;
                   return ( 
                    <tr>
                        <td>{customer.id}</td>
                        <td>{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>
                          <address>
                            {address.street },
                            { " " + address.city},
                            { " " + address.state},
                            { " " + address.country},
                            { " " + address.zipCode}
                          </address>
                        </td>
                        <td><FontAwesomeIcon icon={faEdit} /></td>
                      </tr>
                    );
                  })
                }
              </tbody>
            </Table>
            {paginationBasic}
          </Card>
        </Col>
      </Row>
    </Container>
  );
}
