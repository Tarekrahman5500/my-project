import React, {Component} from 'react';
import {
    Alert,
    Button,
    Dimensions,
    FlatList,
    Modal,
    PanResponder,
    ScrollView,
    StyleSheet,
    Text,
    View
} from 'react-native'
import {Card, Icon, Input, Rating} from 'react-native-elements';
import {connect} from 'react-redux';
import {baseUrl} from '../shared/baseUrl';
import {postComment, postFavorite} from '../redux/ActionCreators';
import {DISHES} from '../shared/dishes';
import {COMMENTS} from '../shared/comments';
import * as Animatable from 'react-native-animatable';

const mapStateToProps = state => {
    return {
        dishes: state.dishes,
        comments: state.comments,
        favorites: state.favorites
    }
}

const mapDispatchToProps = dispatch => ({
    postFavorite: (dishId) => dispatch(postFavorite(dishId)),
    postComment: (dishId, rating, author, comment) => dispatch(postComment(dishId, rating, author, comment))
});



function RenderDish(props) {
    const dish = props.dish;

    this.handleViewRef = ref => this.view = ref;

    const recognizeDrag = ({moveX, moveY, dx, dy}) => {
        return dx < -200;
    };

    const panResponder = PanResponder.create({
        onStartShouldSetPanResponder: (e, gestureState) => {
            return true;
        },
        onPanResponderGrant: () => {
            this.view.rubberBand(1000).then(endState => console.log(endState.finished ? 'finished' : 'cancelled'));
        },
        onPanResponderEnd: (e, gestureState) => {
            if (recognizeDrag(gestureState))
                Alert.alert(
                    'Add Favorite',
                    'Are you sure you wish to add ' + dish.name + ' to favorite?',
                    [
                        {text: 'Cancel', onPress: () => console.log('Cancel Pressed'), style: 'cancel'},
                        {
                            text: 'OK', onPress: () => {
                                props.favorite ? console.log('Already favorite') : props.onPress()
                            }
                        },
                    ],
                    {
                        cancelable: false
                    }
                );
            return true;
        }
    });

    if (dish != null) {
        return (
            <Animatable.View animation="fadeInDown" duration={2000} delay={1000}
                             ref={this.handleViewRef}
                             {...panResponder.panHandlers}>
                <Card featuredTitle={dish.name} image={{uri: baseUrl + dish.image}}>
                    <Text style={{margin: 10}}>
                        {dish.description}
                    </Text>
                    <View style={styles.formRow}>
                        <Icon raised reverse name={props.favorite ? 'heart' : 'heart-o'} type='font-awesome'
                              color='#f50'
                              onPress={() => props.favorite ? console.log('Already favorite') : props.onPress()}/>
                        <Icon raised reverse name={'pencil'} type='font-awesome' color='#512DA8'
                              onPress={() => props.onComment()}/>
                    </View>
                </Card>
            </Animatable.View>
        );
    } else {
        return (<View>

        </View>);
    }
}

function RenderComments(props) {

    const comments = props.comments;

    const renderCommentItem = ({item, index}) => {

        return (
            <View key={index} style={{margin: 10}}>
                <Text style={{fontSize: 14}}>{item.comment}</Text>
                <Rating
                    readonly
                    ratingCount={5}
                    imageSize={15}
                    style={{paddingVertical: 5, flexDirection: 'row', justifyContent: 'flex-start'}}
                    startingValue={item.rating}
                />
                <Text style={{fontSize: 12}}>{item.rating} Stars</Text>
                <Text style={{fontSize: 12}}>{'-- ' + item.author + ', ' + item.date} </Text>
            </View>
        );
    };

    return (
        <Animatable.View animation="fadeInDown" duration={2000} delay={1000}>
            <Card title='Comments'>
                <FlatList
                    data={comments}
                    renderItem={renderCommentItem}
                    keyExtractor={item => item.id.toString()}
                />
            </Card>
        </Animatable.View>
    );
}

class Dishdetail extends Component {

    constructor(props) {
        super(props);
        this.state = {
            dishes: DISHES,
            comments: COMMENTS,
            favorites: [],
            showModal: false,
            rating: '',
            author: '',
            comment: ''
        };
    }

    static navigationOptions = {
        title: 'Dish Details'
    };

    markFavorite(dishId) {
        this.props.postFavorite(dishId);
        this.setState({favorites: this.state.favorites.concat(dishId)});
    }

    toggleModal = () => {
        this.setState({showModal: !this.state.showModal})
    }

    handleComment(dishId) {
        console.log(JSON.stringify(this.state));
        this.toggleModal();
        this.props.postComment(dishId,
            this.state.rating,
            this.state.author,
            this.state.comment);
    }


    render() {
        const dishId = this.props.navigation.getParam('dishId', '');
        // console.log(this.props);
        return (
            <ScrollView style={{flex: 1}}>
                <RenderDish dish={this.props.dishes.dishes[+dishId]}
                            favorite={this.props.favorites.some(el => el === dishId)}
                            onPress={() => this.markFavorite(dishId)}
                            onComment={() => this.toggleModal()}
                />
                <RenderComments comments={this.props.comments.comments.filter((comment) => comment.dishId === dishId)}/>

                <Modal
                    animationType={'slide'}
                    transparent={false}
                    visible={this.state.showModal}
                    onDismiss={() => {
                        this.toggleModal()
                    }}
                    onRequestClose={() => {
                        this.toggleModal()
                    }}>
                    <View style={styles.modal}>
                        <View>
                            <Rating type="star"
                                    ratingCount={5}
                                    fractions={0}
                                    startingValue={this.state.rating}
                                    imageSize={38}
                                    onFinishRating={rating => this.setState({rating: rating})}
                                    showRating/>
                        </View>
                        <View style={styles.modalText}>
                            <Input placeholder='Author'
                                   leftIcon={
                                       <Icon name='user-o' type='font-awesome' size={24}/>
                                   }
                                   onChangeText={author => this.setState({author})}/>
                        </View>
                        <View style={styles.modalText}>
                            <Input placeholder='Comment'
                                   leftIcon={
                                       <Icon name='comment-o' type='font-awesome' size={24}/>
                                   }
                                   onChangeText={comment => this.setState({comment})}/>
                        </View>
                        <View style={styles.modalText}>
                            <Button
                                onPress={() => {
                                    this.handleComment(dishId)
                                }}
                                color='#512DA8'
                                title='Submit'
                            />
                        </View>
                        <View style={styles.modalText}>
                            <Button
                                onPress={() => {
                                    this.toggleModal();
                                }}
                                color='#984500'
                                title='Close'
                            />
                        </View>
                    </View>
                </Modal>
            </ScrollView>
        );
    }
}

const styles = StyleSheet.create({
    formRow: {
        alignItems: 'center',
        flexDirection: 'row',
        flex: 1,
        marginLeft: Dimensions.get('window').width / 4
    },
    modalText: {
        fontSize: 18,
        margin: 10
    },
    modal: {
        justifyContent: 'center',
        margin: 20,
    }
})
export default connect(mapStateToProps, mapDispatchToProps)(Dishdetail);
