import { expect } from 'chai';
import { config } from './index';

describe('Config', () => {

  it('"env" to be "test"', () => {
    expect(config.env).to.be.eq('test');
  });

  it('"port" to be number', () => {
    const portNumber = parseInt(config.port, 10);
    expect(portNumber).to.exist;
  });

  it('"ip" to be equal "localhost"', () => {
    expect(config.ip).to.be.eq('localhost');
  });

  it('"mongo.uri" to be string', () => {
    expect(typeof config.mongo.uri).to.be.eq('string');
  });

  it('"auth.secret" to be string', () => {
    expect(typeof config.auth.secret).to.be.eq('string');
  });

  it('"auth.secret" to be defined', () => {
    expect(config.auth.secret).to.exist;
  });
});
