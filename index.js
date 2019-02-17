const url = require('url');
const os = require('os');
const net = require('net');
const tls = require('tls');
const { Produce: Producer } = require('glossy');
const { LEVEL, MESSAGE } = require('triple-beam');

const Transport = require('winston-transport');

/**
 * Transport for outputting to the console.
 * @type {Papertrail}
 * @extends {Transport}
 */
module.exports = class Papertrail extends Transport {
  /**
   * @param {!Object} options - Options for this instance.
   */
  constructor(options) {
    super(options);

    this.url = url.parse(options.url);

    this.host = options.host || os.hostname();
    this.appName = options.appName || process.title;

    this._promises = {};

    this.producer = new Producer({
      facility: 'daemon'
    });
  }

  async log(info, callback) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    try {
      const socket = await this.socket();

      const message = this.producer.produce({
        severity: this.levels[info[LEVEL]] || info[LEVEL],
        host: this.host,
        appName: this.appName,
        date: new Date(),
        message: info[MESSAGE]
      }) + '\r\n';

      if (message) socket.write(message, callback);
      else callback();
    } catch (error) {
      console.error(error);
    }
  }

  /**
   * @return {Promise<net.Socket>} the tls socket for papertrail
   */
  async socket() {
    if (!this._promises.socket) {
      this._promises.socket = new Promise((resolve, reject) => {
        /** @type {net.Socket} */
        let socket;

        if (this.url.protocol === 'https:') {
          socket = tls.connect({
            host: this.url.hostname,
            port: Number(this.url.port),
            rejectUnauthorized: true
          });

          socket.once('secureConnect', () => {
            if (socket.authorized) resolve(socket);
            else reject(socket.authorizationError);
          });
        } else {
          socket = net.createConnection(Number(this.url.port), this.url.hostname);

          socket.once('connect', () => resolve(socket));
        }

        socket.on('error', (error) => {
          this._promises.socket = Promise.reject(error);
        });

        socket.once('destroy', () => {
          delete this._promises.socket;
        });

        socket.once('end', () => {
          delete this._promises.socket;
        });
      });
    }

    return this._promises.socket;
  }
};
