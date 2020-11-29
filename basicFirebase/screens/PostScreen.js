import * as React from 'react';
import {Text, TouchableOpacity, Image, View, StyleSheet} from 'react-native';

import * as ImagePicker from 'react-native-image-picker';
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import {LinearGradient} from 'react-native-linear-gradient';

import CustomHeader from '../components/Header';
import CustomBottomTab from '../components/BottomTab';
import CustomText from '../components/TextField';

import API_KEY from '../env';

export default class PostScreen extends React.Component {
  state = {
    image: null,
    address: '',
    lat: null,
    long: null,
  };

  render() {
    let {image} = this.state;

    return (
      <LinearGradient colors={['#2193b0', '#6dd5ed']} style={styles.container}>
        <CustomHeader
          nav={this.props.navigation}
          title={'Post'}
          searchBar={true}
        />
        <View style={{flex: 1}}>
          <RNCamera
            ref={(ref) => {
              this.camera = ref;
            }}
            style={styles.scanner}
            onGoogleVisionBarcodesDetected={this.barcodeRecognized}>
            {this.renderBarcodes}
          </RNCamera>
          <CustomBottomTab nav={this.props.navigation} />
        </View>
      </LinearGradient>
    );
  }

  componentDidMount() {
    this.getPermissionAsync();
  }

  getPermissionAsync = async () => {
    if (Constants.platform.ios) {
      const {status} = await Permissions.askAsync(Permissions.CAMERA_ROLL);
      if (status !== 'granted') {
        alert('Sorry, we need camera roll permissions to make this work!');
      }

      const {status2} = await Permissions.askAsync(Permissions.CAMERA);
      if (status2 !== 'granted') {
        alert('Sorry, we need camera permissions to make this work!');
      }
    }
  };

  _pickImage = async () => {
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
        base64: false,
      });
      if (!result.cancelled) {
        this.setState({image: result.uri});
      }
    } catch (E) {
      console.log(E);
    }
  };

  _takePhoto = async () => {
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [3, 4],
        quality: 1,
        base64: false,
      });
      if (!result.cancelled) {
        this.setState({image: result.uri});
      }
    } catch (E) {
      console.log(E);
    }
  };

  _submitPhoto = () => {
    let photo = {uri: this.state.image};
    let formdata = new FormData();

    formdata.append(
      'location',
      '(' + this.state.lat.toString() + ', ' + this.state.long.toString() + ')',
    );
    formdata.append('file', {
      uri: photo,
      name: 'image.jpg',
      type: 'image/jpeg',
    });

    fetch('https://activistarmor.space/post', {
      method: 'POST',
      headers: {
        'Content-Type': 'multipart/form-data',
      },
      body: formdata,
    })
      .then((response) => {
        console.log('form sent');
      })
      .catch((err) => {
        console.log(err);
      });
  };
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eeeeee',
  },
  emptyPhoto: {
    width: 100,
    height: 100,
    borderRadius: 5,
    flex: 0.7,
  },
  infoCard: {
    backgroundColor: 'lightblue',
    margin: 5,
    padding: 12,
    borderRadius: 5,
    elevation: 2,
    width: '100%',
  },
  postButton: {
    backgroundColor: 'lightgreen',
    margin: 30,
    marginBottom: 30,
    padding: 12,
    borderRadius: 5,
    elevation: 2,
  },
  infoCardText: {
    textAlign: 'center',
    fontSize: 18,
  },
  scanner: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
});
