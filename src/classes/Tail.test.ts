import { expect } from 'chai'
import fs from 'fs'
import Tail from './Tail'

const test_filename = './testing/tailTest.txt'

const getTailResult = async (filename: string, input: string[]): Promise<string[]> => {
  return new Promise(resolve => {
    const tail = new Tail(filename)
    const result: string[] = []
    tail.on('line', line => result.push(line))
    tail.on('lines_end', () => resolve(result))
    tail.tail()

    for (const item of input) {
      fs.appendFileSync(filename, `${item}\n`)
    }
  })
}

describe('Testing the Tail class', () => {
  before(() => {
    fs.writeFileSync(test_filename, 'Row 1\nRow 2\n')
  })

  it('Should tail a file and catch two appended rows', async() => {
    const input: string[] = ['Row 3', 'Row 4']
    const result = await getTailResult(test_filename, input)
    expect(result).to.deep.equal(input)
  })

  after(() => {
    fs.rmSync(test_filename)
  })
})