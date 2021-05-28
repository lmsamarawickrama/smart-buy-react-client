import React, { Component, Fragment } from 'react';
import { withOktaAuth } from '@okta/okta-react';
import { withRouter, Route, Redirect, Link } from 'react-router-dom';
import {
    withStyles,
    Typography,
    Fab,
    IconButton,
    Paper,
    List,
    ListItem,
    ListItemText,
    ListItemSecondaryAction,
} from '@material-ui/core';
import { Delete as DeleteIcon, Add as AddIcon } from '@material-ui/icons';
import moment from 'moment';
import { find, orderBy } from 'lodash';
import { compose } from 'recompose';

import SupermarketEditor from '../components/supermarketEditor';
import ErrorSnackbar from '../components/ErrorSnackbar';

const styles = theme => ({
    supermarkets: {
        marginTop: theme.spacing(2),
    },
    fab: {
        position: 'absolute',
        bottom: theme.spacing(3),
        right: theme.spacing(3),
        [theme.breakpoints.down('xs')]: {
            bottom: theme.spacing(2),
            right: theme.spacing(2),
        },
    },
});

const API = process.env.REACT_APP_API;

class SupermarketManager extends Component {
    state = {
        loading: true,
        supermarkets: [],
        error: null,
    };

    componentDidMount() {
        this.getSupermarkets();
    }

    async fetch(method, endpoint, body) {
        try {
            const response = await fetch(`${API}${endpoint}`, {
                method,
                body: body && JSON.stringify(body),
                headers: {
                    'content-type': 'application/json',
                    accept: 'application/json',
                    authorization: `Bearer ${await this.props.authService.getAccessToken()}`,
                },
            });
            return await response.json();
        } catch (error) {
            console.error(error);

            this.setState({ error });
        }
    }

    async getSupermarkets() {
        this.setState({ loading: false, supermarkets: (await this.fetch('get', '/supermarkets')) || [] });
    }

    saveSupermarkets = async (supermarket) => {
        if (supermarket.id) {
            await this.fetch('put', `/supermarkets/${supermarket.id}`, supermarket);
        } else {
            await this.fetch('post', '/supermarkets', supermarket);
        }

        this.props.history.goBack();
        this.getSupermarkets();
    }

    async deleteSupermarkets(supermarket) {
        if (window.confirm(`Are you sure you want to delete "${supermarket.name}"`)) {
            await this.fetch('delete', `/supermarkets/${supermarket.id}`);
            this.getSupermarkets();
        }
    }

    renderSupermarketEditor = ({ match: { params: { id } } }) => {
        if (this.state.loading) return null;
        const supermarket = find(this.state.supermarkets, { id: Number(id) });

        if (!supermarket && id !== 'new') return <Redirect to="/supermarkets" />;

        return <SupermarketEditor supermarket={supermarket} onSave={this.saveSupermarkets} />;
    };

    render() {
        const { classes } = this.props;

        return (
            <Fragment>
                <Typography variant="h4">Supermarkets Manager</Typography>
                {this.state.supermarkets.length > 0 ? (
                    <Paper elevation={1} className={classes.supermarkets}>
                        <List>
                            {orderBy(this.state.supermarkets, ['updatedAt', 'name'], ['desc', 'asc']).map(supermarket => (
                                <ListItem key={supermarket.id} button component={Link} to={`/supermarkets/${supermarket.id}`}>
                                    <ListItemText
                                        primary={supermarket.name}
                                        secondary={supermarket.updatedAt && `Updated ${moment(supermarket.updatedAt).fromNow()}`}
                                    />
                                    <ListItemSecondaryAction>
                                        <IconButton onClick={() => this.deleteSupermarkets(supermarket)} color="inherit">
                                            <DeleteIcon />
                                        </IconButton>
                                    </ListItemSecondaryAction>
                                </ListItem>
                            ))}
                        </List>
                    </Paper>
                ) : (
                    !this.state.loading && <Typography variant="subtitle1">No supermarkets to display</Typography>
                )}
                <Fab
                    color="secondary"
                    aria-label="add"
                    className={classes.fab}
                    component={Link}
                    to="/supermarkets/new"
                >
                    <AddIcon />
                </Fab>
                <Route exact path="/supermarkets/:id" render={this.renderSupermarketEditor} />
                {this.state.error && (
                    <ErrorSnackbar
                        onClose={() => this.setState({ error: null })}
                        message={this.state.error.message}
                    />
                )}
            </Fragment>
        );
    }
}

export default compose(
    withOktaAuth,
    withRouter,
    withStyles(styles),
)(SupermarketManager);