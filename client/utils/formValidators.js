const regex = {
    email: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/
}

export const validateEmail = (value) => {
    if (!regex.email.test(value)) {
        return {
            valid: false,
            message: 'Please enter valid email'
        }
    }
        
    return {
        valid: true,
        message: ''
    }
}

export const validatePassword = (value) => {
    if (value.length < 8) {
        return {
            valid: false,
            message: 'Password must contain at least 8 symbols'
        }
    }

    return {
        valid: true,
        message: ''
    }
}