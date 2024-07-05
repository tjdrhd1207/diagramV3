"use client"

import { Alert, AlertColor, Box, Button, Card, CardActionArea, CardContent, CssBaseline, Grid, Link, Skeleton, Stack, ThemeProvider, Typography, createTheme } from "@mui/material"
import React from "react"
import { Domain, DomainTwoTone, PolylineTwoTone } from "@mui/icons-material"
import { EllipsisLabel } from "@/components/common/typhography"
import { customTheme } from "@/consts/theme"
import { FormText } from "@/components/common/form"
import { useRouter } from "next/navigation"
import { create } from "zustand"
import { CustomModal, CustomModalContents, CustomModalTitle } from "@/components/common/modal"
import { authWithPassword } from "@/service/fetch/functional-api"
import { createUserAccount } from "@/service/fetch/crud-api"

interface LoginFormState {
    id: string;
    password: string;
    setID: (value: string) => void;
    setPassword: (value: string) => void;
}

interface AlertState {
    showAlert: boolean
    variant: "filled" | "standard" | "outlined" | undefined;
    serverity: AlertColor | undefined;
    message: string | undefined;
    setShow: (variant: "filled" | "standard" | "outlined" | undefined, serverity: AlertColor | undefined, message: string | undefined) => void;
    setHide: () => void;
}

const _useLoginFormState = create<LoginFormState & AlertState>((set) => ({
    id: "",
    password: "",
    setID: (value) => set({ id: value}),
    setPassword: (value) => set({ password: value}),
    showAlert: false,
    variant: undefined,
    serverity: undefined,
    message: undefined,
    setShow: (variant, serverity, message) => set({ showAlert: true, variant: variant, serverity: serverity, message: message }),
    setHide: () => set({ showAlert: false })
}))

interface NewAccountDialogState {
    open: boolean;
    setOpen: () => void;
    setClose: () => void;
    step: number;
    setStep: (value: number) => void;
}

const _useNewAccountDialogState = create<NewAccountDialogState & LoginFormState>((set) => ({
    open: false,
    setOpen: () => set({ open: true, step: 1 }),
    setClose: () => set({ open: false }),
    id: "",
    password: "",
    setID: (value) => set({ id: value}),
    setPassword: (value) => set({ password: value}),
    step: 1,
    setStep: (value) => set({ step: value })
}))

const LoginForm = () => {
    const id = _useLoginFormState((state) => state.id);
    const password = _useLoginFormState((state) => state.password);
    const setID = _useLoginFormState((state) => state.setID);
    const setPassword = _useLoginFormState((state) => state.setPassword);
    const showAlert = _useLoginFormState((state) => state.showAlert);
    const alertMessage = _useLoginFormState((state) => state.message);
    const setShow = _useLoginFormState((state) => state.setShow);
    const setHide = _useLoginFormState((state) => state.setHide);

    const setOpen = _useNewAccountDialogState((state) => state.setOpen);
    
    const router = useRouter();

    const handleLogin = () => {
        if (id && password) {
            authWithPassword({
                userName: id,
                password: password
            }, {
                onOK: () => router.push("/manager"),
                onError: (message) => setShow("filled", "error", message)
            });
        }
    }

    const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            handleLogin();
        }
    }

    return (
        <Stack width="100%" height="100%" padding="5%" rowGap={5} onKeyDown={handleEnter}>
            <EllipsisLabel variant="h4">
                Welcome to the enterace<br />Log in to continue.
            </EllipsisLabel>
            <EllipsisLabel variant="h5">
                Don't have an account? <Link onClick={() => setOpen()}>Create a new account.</Link>
            </EllipsisLabel>
            <Stack width="70%" rowGap={2}>
                <FormText autoFocus formTitle="ID" formValue={id} onFormChanged={(value) => setID(value)}></FormText>
                <FormText formTitle="Password" formValue={password} onFormChanged={(value) => setPassword(value)} type="Password"></FormText>
            </Stack>
            {
                showAlert && <Alert variant="filled" severity="error" onClose={setHide}>{alertMessage}</Alert>
            }
            <Button variant="contained" onClick={handleLogin} disabled={!id || !password}>Log in</Button>
        </Stack>
    )
}

const NewAccountDialog = () => {
    const open = _useNewAccountDialogState((state) => state.open);
    const setClose = _useNewAccountDialogState((state) => state.setClose);
    const id = _useNewAccountDialogState((state) => state.id);
    const password = _useNewAccountDialogState((state) => state.password);
    const setID = _useNewAccountDialogState((state) => state.setID);
    const setPassword = _useNewAccountDialogState((state) => state.setPassword);
    const step = _useNewAccountDialogState((state) => state.step);
    const setStep = _useNewAccountDialogState((state) => state.setStep);

    const handleClean = () => {
        setID("");
        setPassword("");
        setStep(1);
    }

    const handleCreateUser = () => {
        if (id && password) {
            createUserAccount({
                userName: id,
                password: password
            }, {
                onOK: () => {setClose()},
                onError: (message) => {}
            })
        }
    }

    const handleEnter = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (event.key === "Enter") {
            handleCreateUser();
        }
    }

    const handleEnterID = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (id && event.key === "Enter") {
            setStep(2);
        }
    }

    const handleEnterPassword = (event: React.KeyboardEvent<HTMLDivElement>) => {
        if (id && password && event.key === "Enter") {
            setStep(3);
        }
    }

    return (
       <CustomModal open={open} onClose={setClose} onTransitionEnter={handleClean}>
            <CustomModalTitle title="Create New Account"></CustomModalTitle>
            <CustomModalContents>
                <Stack width="100%" height="100%" rowGap={2} onKeyDown={handleEnter}>
                    <Stack direction="row" columnGap={1} onKeyDown={handleEnterID}>
                        <FormText autoFocus formTitle="Enter your ID" formValue={id} onFormChanged={setID}></FormText>
                        {/* <Button variant="outlined" onClick={() => setStep(2)}>Continue</Button> */}
                    </Stack>
                    {
                        step >= 2 && 
                            <Stack direction="row" columnGap={1} onKeyDown={handleEnterPassword}>
                                <FormText autoFocus formTitle="Create a password" formValue={password} onFormChanged={setPassword} type="Password" />
                                {/* <Button variant="outlined" onClick={() => setStep(3)}>Continue</Button> */}
                            </Stack>
                    }
                    {
                        step >= 3 &&
                            <Stack width="100%" direction="row" justifyContent="end" columnGap={1}>
                                <Button variant="contained" onClick={handleCreateUser}>Create</Button>
                                <Button variant="outlined" onClick={() => setClose()}>Cancel</Button>
                            </Stack>
                    }
                </Stack>
            </CustomModalContents>
       </CustomModal>
    )
}

const Page = () => {
    return (
        <ThemeProvider theme={customTheme}>
            <CssBaseline>
                <Box width="100wh" height="100vh" padding="5%">
                    <Grid container height="100%">
                        <Grid item xs={6} padding="2%">
                            <LoginForm />
                        </Grid>
                        <Grid item xs={6} padding="5%">
                            <Box width="100%" height="100%">
                                <Skeleton variant="rounded" width="100%" height="100%" />
                            </Box>
                        </Grid>
                    </Grid>
                </Box>
                <NewAccountDialog />
                {/* <Box width="100wh" height="100vh" paddingInline="10%">
                    <Grid container height="100%">
                        <Grid item xs={6}>
                            <Box width="100%" height="100%" padding="5%"
                                display="flex" alignItems="center" justifyContent="center"
                            >
                                <Card variant="outlined" sx={{ width: "50%", height: "30%" }}>
                                    <CardActionArea href="/manager" sx={{ height: "100%" }}>
                                        <CardContent sx={{ alignContent: "center", height: "100%" }}>
                                            <Stack alignItems="center" gap={1}>
                                                <DomainTwoTone fontSize="large" color="primary"/>
                                                <EllipsisLabel variant="h5">Project Manager</EllipsisLabel>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        </Grid>
                        <Grid item xs={6}>
                            <Box width="100%" height="100%" padding="10%"
                                display="flex" alignItems="center" justifyContent="center"
                            >
                                <Card variant="outlined" sx={{ width: "50%", height: "30%" }}>
                                    <CardActionArea href="/designer" sx={{ height: "100%" }}>
                                        <CardContent sx={{ alignContent: "center", height: "100%" }}>
                                            <Stack alignItems="center" gap={1}>
                                                <PolylineTwoTone fontSize="large" color="primary" />
                                                <EllipsisLabel variant="h5">ScenarioDesigner</EllipsisLabel>
                                            </Stack>
                                        </CardContent>
                                    </CardActionArea>
                                </Card>
                            </Box>
                        </Grid>
                    </Grid>
                </Box> */}
            </CssBaseline>
        </ThemeProvider>
    )
}

export default Page