import {useState} from 'react';
import {Link} from 'react-router-dom';


const CartView = ({cart, updateQuantity, removeFromCart, clearCart}) => {
    const [statusMessage, setStatusMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const 
}
