// user-app/src/UserComponent.jsx
import React, { useState } from 'react';
import { useMutation, gql } from '@apollo/client';
import { Alert, Button, Form, Container, Nav, Spinner } from 'react-bootstrap';

// GraphQL mutations
const LOGIN_MUTATION = gql`
  mutation Login($username: String!, $password: String!) {
    login(username: $username, password: $password)
  }
`;

const REGISTER_MUTATION = gql`
  mutation Register($username: String!, $password: String!) {
    register(username: $username, password: $password)
  }
`;

function UserComponent() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [activeTab, setActiveTab] = useState('login');
    const [authError, setAuthError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const [login] = useMutation(LOGIN_MUTATION, {
        onCompleted: () => {
            console.log("✅ Login successful, reloading page...");

            // window.location.reload();  // ✅ Ensures the browser fetches the new cookie

            // Dispatch custom event upon successful login
            window.dispatchEvent(new CustomEvent('loginSuccess', { detail: { isLoggedIn: true } }));
        },
        onError: (error) => setAuthError(error.message || 'Login failed'),
    });

    const [register] = useMutation(REGISTER_MUTATION, {
        onCompleted: () => {
            alert("Registration successful! Please log in.");
            setActiveTab('login'); // Switch to login view
        },
        onError: (error) => setAuthError(error.message || 'Registration failed'),
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        setAuthError('');

        console.log(`Username: ${username}, Password: ${password}`);

        if (!username || !password) {
            setAuthError('Username and password are required.');
            setIsSubmitting(false);
            return;
        }

        if (activeTab === 'login') {
            await login({ variables: { username, password } });
        } else {
            await register({ variables: { username, password } });
        }
        setIsSubmitting(false);
    };

    return (
        <Container className="p-5">
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k)}>
                <Nav.Item>
                    <Nav.Link eventKey="login">Login</Nav.Link>
                </Nav.Item>
                <Nav.Item>
                    <Nav.Link eventKey="signup">Sign Up</Nav.Link>
                </Nav.Item>
            </Nav>

            <Form onSubmit={handleSubmit} className="mt-3">
                <Form.Group className="mb-3">
                    <Form.Label>Username</Form.Label>
                    <Form.Control 
                        type="text" 
                        placeholder="Username" 
                        value={username} 
                        onChange={(e) => setUsername(e.target.value)} />
                </Form.Group>

                <Form.Group className="mb-3">
                    <Form.Label>Password</Form.Label>
                    <Form.Control 
                        type="password" 
                        placeholder="Password" 
                        value={password} 
                        onChange={(e) => setPassword(e.target.value)} />
                </Form.Group>

                {authError && <Alert variant="danger">{authError}</Alert>}

                <Button variant="primary" type="submit" disabled={isSubmitting}>
                    {isSubmitting ? <Spinner as="span" animation="border" size="sm" role="status" aria-hidden="true" /> : activeTab === 'login' ? 'Login' : 'Sign Up'}
                </Button>
            </Form>
        </Container>
    );
}

export default UserComponent;

