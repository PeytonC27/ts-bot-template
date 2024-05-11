"use strict";
class LoyaltyManager {
    #accessToken;
    #channel;
    #xhr;
    constructor(accessToken, channel) {
        this.#accessToken = accessToken;
        this.#channel = channel;
        this.#xhr = new XMLHttpRequest();
        this.#xhr.withCredentials = true;
    }
    get(username) {
        var data = JSON.stringify(false);
        this.#xhr.open("GET", `https://streamlabs.com/api/v1.0/points?access_token=${this.#accessToken}&username=${username}&channel=${this.#channel}`);
        this.#xhr.send(data);
        return data;
    }
}
