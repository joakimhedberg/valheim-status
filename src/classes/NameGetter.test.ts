import { expect } from 'chai'
import NameGetter from './NameGetter'

describe('Testing the name getters', () => {
  it('Should fetch a predefined name from the KnownNames list', async() => {
    const result = await NameGetter.getName(undefined, '12345')
    return expect(result).to.equal('Greger')
  })

  it('Should get an undefined response from the name getter', async() => {
    const result = await NameGetter.getName(undefined, '0000')
    return expect(result).to.be.undefined
  })
})