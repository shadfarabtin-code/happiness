import React, {useState} from "react";

import { Button } from "@chakra-ui/react"
import { Input } from "@chakra-ui/react"
import { Heading } from "@chakra-ui/react"
import { VStack } from "@chakra-ui/react"
import { Box } from "@chakra-ui/react"
import { AbsoluteCenter } from "@chakra-ui/react"



const SignIn = () => {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")

    async function handleLogin() {
        const response = await fetch("http://localhost:8000/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ email: email, password: password }),
        })

        const data = await response.json()
        console.log(data)
    }

    return (
        <AbsoluteCenter>
            <Box p={5} borderWidth={1} borderRadius={8} boxShadow="lg">
                <VStack gap={5}>
                    <Heading>Sign In</Heading>
                    <Input 
                        placeholder="Email" 
                        type="email" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />
                    <Input 
                        placeholder="Password" 
                        type="password" 
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />
                    <Button onClick={handleLogin}>Sign In</Button>
                </VStack>
            </Box>
        </AbsoluteCenter>
    )
}

export default SignIn