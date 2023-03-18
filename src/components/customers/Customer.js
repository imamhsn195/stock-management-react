import {React, useEffect, useState} from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEdit, faArrowUpWideShort, faArrowDownShortWide, faTrash, faMessage } from "@fortawesome/free-solid-svg-icons";
import { Col, Container, Form, Row, Card, Table, Button, ToastContainer, Toast } from "react-bootstrap";
import Select from 'react-select';
import Pagination from 'react-bootstrap/Pagination';
import { useForm } from "react-hook-form";
import * as yup from "yup";
import { yupResolver } from "@hookform/resolvers/yup";
import axios from 'axios';
const api = `http://localhost:8888//api`;

const CustomerSchema = yup.object({
    name: yup.string().required(),
    email: yup.string().email("Email is not correct.").required("Email is required."),
    phone: yup.string().required(),
    address: yup.object({
        street: yup.string().required("Street is required."),
        city: yup.string().required("City is required."),
        state: yup.string().required("State is required."),
        country: yup.string().required("Country is required."),
        zipCode: yup.string().required("Zip Code is required.")
      })
  });
export default function Customer(){
    const notify = () => Toast("Wow so easy!");
    // register customer
    const [isExistingAddressSelected, setExistingAddressSelected] = useState(false);
    const [paginated, setPaginated] = useState(true)
    const [addresses, setAddresses] = useState([]);
    const [buttonLabel, setButtonLabel] = useState("Register Record");
    const fetchAddresses = async () => {
        await axios.get(`${api}/addresses?paginated=${paginated}&sortBy=id`)
          .then(response => {setAddresses(response.data)}); 
        }
    const [selectedAddress, setSelectedAddress] = useState(null)
    const options = addresses?.content?.map((address, index) => ({ value: address.id, label: address.street + ", " + address.city + ", " + address.state + ", " + address.country, key: `option-${index}`}));
    const handleAddressChange = (selectedAddress) => { 
        setValue('address', selectedAddress.value !== 0 ? addresses?.content?.filter(address => address.id === selectedAddress.value )[0] : 0);
        setSelectedAddress(selectedAddress)
        setExistingAddressSelected(true)
    }
    const { register, handleSubmit, reset ,setValue , formState: { errors }, } = useForm({ mode: 'onBlur', resolver: yupResolver(CustomerSchema), });
    const onSubmit = async (customer) => { 
        axios.post(`${api}/customers`, customer)
            .then(function (response) {  
                console.log(response.data); reset(); fetchCustomers(); setSelectedAddress({})})
            .catch(function (error) { console.log(error);reset();});
      };
      useEffect(() => { fetchAddresses()}, []);

    // list customers
    const [allCustomers, setAllCustomers] = useState([]);
    const [activePage, setActivePage] = useState(1)
    const [sort, setSort] = useState('id')
    const [pageSize, setPageSize] = useState(5)
    
    const totalPages = allCustomers.totalPages;
    const items = [<Pagination.First key={"prev"} disabled={allCustomers.first} onClick={() => setActivePage(activePage-1)}>Prev Page</Pagination.First>];
      for (let number = 1; number <= totalPages; number++) {
        items.push(
          <Pagination.Item key={number} active={number === activePage} onClick={(e) => setActivePage(+e.target.text)}>
            {number}
          </Pagination.Item>
        );
      }
      items.push(
        <Pagination.Last key={"next"}  disabled={allCustomers.last}  onClick={() => setActivePage(activePage+1)}>Next Page</Pagination.Last>
      );
    const paginationBasic = (
        <div>
            <Pagination className='float-end m-2'>{items}</Pagination>
        </div>);
    const fetchCustomers = async () => {
        await axios.get(`${api}/customers?pageNumber=${activePage-1}&pageSize=${pageSize}&sortBy=${sort}`)
            .then(response =>{
                setAllCustomers(response.data)
            });
        };


    // update Customer
    const handerEditCustomer = ((id) => {
        // console.log("Customer ID: ", id);
        const customerToBeUpdated = allCustomers?.content?.find((customer) => {
            return customer.id === id;
        });
        setValue("id", customerToBeUpdated.id)
        setValue("name", customerToBeUpdated.name)
        setValue("email", customerToBeUpdated.email)
        setValue("phone", customerToBeUpdated.phone)
        setValue("address", customerToBeUpdated.address)
        setSelectedAddress(customerToBeUpdated.address)
        setButtonLabel("Update Recored")
    });

    const handleDeleteCustomer = (id) => {
        axios
        .delete(`${api}/customers/${id}`, response=> console.log("Delete Response: ",response))
        .then("Then Response: ", response => console.log(response))
        .catch(response => console.info(response));
    }
    const handleClearFormButton = () => {
        setButtonLabel("Register Record")
        setExistingAddressSelected(false)
        setSelectedAddress({})
    }
    useEffect(() => { fetchCustomers()}, [activePage,sort]);
    return (
        <Container>
        <Row>
            <Col xs={12} md={4}>
                <Card>
                    <Card.Header >Registration Form</Card.Header>
                    <Form onSubmit={handleSubmit(onSubmit)} className="p-3">
                    <input type={"hidden"} {...register("address.id")}/>
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
                            value={selectedAddress}
                            onChange={handleAddressChange}
                            isSearchable
                        />
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="street">
                        <Form.Control
                            {...register("address.street")}
                            type="text"
                            placeholder="Enter street"
                            value={ selectedAddress?.street }
                            readOnly={isExistingAddressSelected}
                        />
                        {errors.address?.street?.type === "required" && (
                        <p role="alert" className="text-danger">
                            {errors.address?.street.message}
                        </p>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="city">
                        <Form.Control
                            {...register("address.city")}
                            type="text"
                            placeholder="Enter city"
                            value={ selectedAddress?.city }
                            readOnly={isExistingAddressSelected}
                        />
                        {errors.address?.city?.type === "required" && (
                        <p role="alert" className="text-danger">
                            {errors.address?.city.message}
                        </p>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="state">
                        <Form.Control
                            {...register("address.state")}
                            type="text"
                            placeholder="Enter State"
                            value={ selectedAddress?.state }
                            readOnly={isExistingAddressSelected}
                        />
                        {errors.address?.state?.type === "required" && (
                        <p role="alert" className="text-danger">
                            {errors.address?.state.message}
                        </p>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="country">
                        <Form.Control
                            {...register("address.country")}
                            type="text"
                            placeholder="Enter country"
                            value={ selectedAddress?.country }
                            readOnly={isExistingAddressSelected}
                        />
                        {errors.address?.country?.type === "required" && (
                        <p role="alert" className="text-danger">
                            {errors.address?.country.message}
                        </p>
                        )}
                    </Form.Group>
                    <Form.Group className="mb-3" controlId="zipCode">
                        <Form.Control
                            {...register("address.zipCode")}
                            type="zipCode"
                            placeholder="Enter Zip Code"
                            value={ selectedAddress?.zipCode }
                            readOnly={isExistingAddressSelected}
                        />
                        {errors.address?.zipCode?.type === "required" && (
                        <p role="alert" className="text-danger">
                            {errors.address?.zipCode.message}
                        </p>
                        )}
                    </Form.Group>
                        <div className="d-grid gap-2">
                            <Button id="submit_button" variant="primary" size="sm" type="submit">
                                { buttonLabel }
                            </Button>
                            <Button variant="danger" size="sm" type="reset" onClick={ handleClearFormButton }>
                                Clear Form
                            </Button>
                            
                        </div>
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
                            <tr key={customer.id}>
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
                                <td>
                                    <Button className="btn btn-link" 
                                        onClick={() => handerEditCustomer(customer.id)}>
                                            <FontAwesomeIcon icon={faEdit}/>
                                    </Button>
                                    <Button className="btn btn-link"
                                        // onClick={handleDeleteCustomer(customer.id)}
                                    >
                                        <FontAwesomeIcon className="text-danger" icon={ faTrash } />
                                    </Button>
                                    
                                </td>
                            </tr>
                            );
                        })
                        }
                    </tbody>
                    </Table>
                    <button onClick={() => notify}>Notify</button>
                    {paginationBasic}
                </Card>
            </Col>
        </Row>
        </Container>
    );
}