import { loginRequest } from '../auth.api' const submit = async () => { const
data = await loginRequest({ email, password, }) localStorage.setItem('token',
data.access_token) }
