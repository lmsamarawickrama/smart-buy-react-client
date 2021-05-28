import {AppBar, Toolbar, Typography, withStyles, Button} from '@material-ui/core';
import { Link } from 'react-router-dom';

import LoginButton from './LoginButton';

const styles = {
    flex: {
        flex: 1,
    },
};

const AppHeader = ({classes}) => (
    <AppBar position="static">
        <Toolbar>
            <Typography variant="h6" color="inherit">
                <Button color="inherit" component={Link} to="/">Home</Button>
                <Button color="inherit" component={Link} to="/supermarkets">Supermarket Manager</Button>
            </Typography>
            <div className={classes.flex}/>
            <LoginButton/>
        </Toolbar>
    </AppBar>
);

export default withStyles(styles)(AppHeader);