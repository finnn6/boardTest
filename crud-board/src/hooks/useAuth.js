import { useState, useEffect } from "react"
import { authService } from "../utils/auth"

export function useAuth() {
    const [isLoggedIn, setIsLoggedIn] = useState(false)
    const [user, setUser] = useState(null)

    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = () => {
        const loggedIn = authService.isAuthenticated()
        setIsLoggedIn(loggedIn)

        if (loggedIn) {
            const userData = authService.getUser()
            setUser(userData)
        }
    }

    const logout = () => {
        authService.logout()
        setIsLoggedIn(false)
        setUser(null)
    }

    return { isLoggedIn, user, logout, checkAuth }
}