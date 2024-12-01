import * as React from 'react';
import Box from '@mui/joy/Box';
import Drawer from '@mui/joy/Drawer';
import Button from '@mui/joy/Button';
import List from '@mui/joy/List';
import Divider from '@mui/joy/Divider';
import ListItem from '@mui/joy/ListItem';
import ListItemButton from '@mui/joy/ListItemButton';
import BinaryInputField from './BinaryInput';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';

export function InputDrawer(props) {
    const [open, setOpen] = React.useState(false);

    const toggleDrawer = (inOpen) => (event) => {
        if (event.type === 'keydown' && (event.key === 'Tab' || event.key === 'Shift')) {
            return;
        }

        setOpen(inOpen);
    };

    return (
        <Box sx={{ display: 'flex' }}>
            <IconButton
                size="large"
                edge="start"
                color="inherit"
                aria-label="menu"
                sx={{ mr: 2 }}
                onClick={toggleDrawer(true)}
            >
                <MenuIcon />
            </IconButton>
            <Drawer open={open} onClose={toggleDrawer(false)}>
                {/* <Box
                    role="presentation"
                    onClick={toggleDrawer(false)}
                    onKeyDown={toggleDrawer(false)}
                > */}
                <BinaryInputField onChange={props.onChange} />
                {/* <Divider /> */}
                {/* <List>
                        {['All mail', 'Trash', 'Spam'].map((text) => (
                            <ListItem key={text}>
                                <ListItemButton>{text}</ListItemButton>
                            </ListItem>
                        ))}
                    </List> */}
                {/* </Box> */}
            </Drawer>
        </Box>
    );
}

export default InputDrawer;