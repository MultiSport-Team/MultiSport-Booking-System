import { useNavigate, Link } from "react-router-dom"
import { loginUser } from "../services/userService"
import { useContext, useState } from "react"
import { toast } from 'react-toastify'
import { UserContext } from "../App"

function Login() {
  const { user, setUser } = useContext(UserContext)
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const signin = async () => {
    try {
      const result = await loginUser(email, password)
      console.log(result)

      if (!result) return

      if (result.status === 'success') {
        sessionStorage.setItem('token', result.data.token)

        setUser({
          id: result.data.id,
          firstName: result.data.first_name,
          lastName: result.data.last_name,
          email: result.data.email,
          role: result.data.role
        })

        toast.success('Login Successful')
        navigate('/')   // change route if needed
      } else {
        toast.error(result.error)
      }

    } catch (ex) {
      console.log(ex)
      toast.error("Something went wrong")
    }
  }

  return (
    <div className='container w-50 mt-4'>
      <div className="mb-3">
        <label className="form-label">Email address</label>
        <input type="email" className="form-control"
          placeholder="name@example.com"
          onChange={(e) => setEmail(e.target.value)} />
      </div>

      <div className='mb-3'>
        <label className="form-label">Password</label>
        <input type="password" className="form-control"
          placeholder='password'
          onChange={e => setPassword(e.target.value)} />
      </div>

      <div className='mb-3'>
        <button className='btn btn-success w-100' onClick={signin}>
          Signin
        </button>
      </div>

      <div className="text-center">
        <label> Don't have an account? </label>
        <Link to="/register"> Click Here</Link>
      </div>
    </div>
  )
}

export default Login
