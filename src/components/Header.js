import * as React from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import './Header.css';
import InputDrawer from './InputDrawer';

function Header(props) {
    const [binaryValue, setBinaryValue] = React.useState('');

    const handleBinaryInputChange = (newValue) => {
        setBinaryValue(newValue);
    };

    return (
        <Box sx={{ flexGrow: 1 }}>
            <AppBar position="static">
                <Toolbar className='custom-toolbar'>
                    <InputDrawer onChange={props.onChange} />
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        真区間グラフの描画ツール
                    </Typography>
                    <Button color="inherit">Login</Button>
                </Toolbar>
            </AppBar>
        </Box>
    );
}

export default Header;
