import { StyledEngineProvider } from '@mui/material/styles';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import _App from './_App'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<StyledEngineProvider injectFirst>
			{/* <CssVarsProvider> */}
				<_App />
			{/* </CssVarsProvider> */}
		</StyledEngineProvider>
	</React.StrictMode>
)