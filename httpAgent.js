import axios from 'axios';
import qs from 'qs';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { acc } from 'react-native-reanimated';

class Agent {
  // TODO: maybe package into small helper superagent auth lib.
  constructor(
    API_ROOT = '/',
    tokenKeyName = '@secureJwt',
    setTokenInStorage = true,
    token = '',
  ) {
    console.log(API_ROOT);
    this._responseBody = this._responseBody.bind(this);
    this.API_ROOT = API_ROOT;
    this.axios = axios;
    this.tokenKeyName = tokenKeyName;
    this.setTokenInStorage = setTokenInStorage;
    this.token = token;
    this.axios.interceptors.request.use(
      async function (config) {
        const token = this.setTokenInStorage
          ? await Agent.getToken(this.tokenKeyName)
          : this.token;
        config.headers.Authorization = `Token ${token}`;
        return config;
      }.bind(this),
    );
  }

  static getToken(tokenKeyName) {
    // gets the token from local-storage
    return AsyncStorage.getItem(tokenKeyName);
  }

  static setToken(token, tokenKeyName) {
    // sets token in local-storage
    return AsyncStorage.setItem(tokenKeyName, token);
  }

  async _tokenPlugin(req) {
    /**
     * plugin superagent uses before each request,
     *  using static method getToken to get token
     * and set in it the header
     * */
    try {
      this.token = await Agent.getToken(this.tokenKeyName);
      req.set('Authorization', `Token ${this.token || ''}`);
      return req;
    } catch (error) {
      console.log('Error while fetching token from storage.', error);
      return req;
    }
  }

  async _responseBody(res) {
    const {accessToken} = res.data.user || {};
    console.log('Did we get a token?!', accessToken);
    if (accessToken) {
      // set in local-storage, so that on next request it's
      // attached in header
      await Agent.setToken(accessToken, this.tokenKeyName);
    }
    return res.data;
  }

  _get(url, fullPath = false, query = {}) {
    return axios
      .get(fullPath ? url : `${this.API_ROOT}${url}`, qs.stringify(query))
      .then(this._responseBody);
  }

  _post(url, body, fullPath = false) {
    return axios
      .post(fullPath ? url : `${this.API_ROOT}${url}`, body)
      .then(this._responseBody);
  }

  _put(url, body, fullPath = false) {
    return axios
      .put(fullPath ? url : `${this.API_ROOT}${url}`, body)
      .then(this._responseBody);
  }
}

export default Agent;
