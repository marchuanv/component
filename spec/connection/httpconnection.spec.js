const { HttpConnection } = require("../../lib/http/httpconnection");
const { HttpRequestQueue } = require("../../lib/http/httprequestqueue");
const { HttpResponseQueue } = require("../../lib/http/httpresponsequeue");
const http = require('http');

describe("when opening an http connection and sending and http request given a hostname and port number", function() {
    beforeAll(async () => {
        this.httpRequestQueue = new HttpRequestQueue();
        this.httpResponseQueue = new HttpResponseQueue();
        this.hostAddress = { address: '127.0.0.1', family: 'IPv4', port: 3000 };
        this.connection = new HttpConnection({ 
            httpRequestQueue: this.httpRequestQueue,
            httpResponseQueue: this.httpResponseQueue,
            hostAddress: this.hostAddress,
            timeout: 5000
        });
        await this.connection.open();
    });
    it("it should return the server host address", () => {
     
        // Arrange
        expect(this.connection.isOpen()).toBeTruthy();

        // Act
        const address = this.connection.getServerAddress();
   
        // Assert
        expect(address).toEqual(this.hostAddress);
    });
    it("it should have a queued request and response", async () => {
     
        // Arrange
        const address = { host: 'localhost', port: 3000 };
        expect(this.connection.isOpen()).toBeTruthy();
        setTimeout( async () => {
            const { httpResponse } = await this.httpResponseQueue.dequeue();
            if (httpResponse instanceof http.ServerResponse) {
                httpResponse.writeHead(200, 'success', {}).end('Hello World from Server');
            }
        }, 2000);

        // Act
        await this.connection.send({ address , path: '/', headers: {}, method: 'POST', data: 'Hello World' });
   
        // Assert
        const { httpResponse } = await this.httpResponseQueue.dequeue();
        expect(httpResponse.body).toEqual('Hello World from Server');
        expect(this.httpResponseQueue.isEmpty()).toBeTruthy();

    });
    it("it should have a closed connection", () => {
        // Arrange
        expect(this.connection.isOpen()).toBeTruthy();

        // Act
        this.connection.close();

        // Assert
        expect(this.connection.isOpen()).toBeFalsy();
    });
});
