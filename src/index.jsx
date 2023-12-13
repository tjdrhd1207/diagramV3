import { StyledEngineProvider } from '@mui/material/styles';
import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'

ReactDOM.createRoot(document.getElementById('root')).render(
	<React.StrictMode>
		<StyledEngineProvider injectFirst>
				<App />
		</StyledEngineProvider>
	</React.StrictMode>
)