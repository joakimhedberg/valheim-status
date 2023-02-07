import { expect } from 'chai'
import FileWatcher from './FileWatcher'
import fs from 'fs'

const test_filename = './testing/fileWatcher.txt'
describe('Testing the file watcher', () => {
  before(() => {
    fs.writeFileSync(test_filename, '')
  })
  
  it('Should detect file changes', async() => {
    const fw = new FileWatcher(test_filename)
    let hadChanges = false
    fw.on('change', () => {
      hadChanges = true
    })
    fw.watch()
    fs.appendFileSync(test_filename, 'Changes happens here')
    await new Promise(resolve => setTimeout(resolve, 100))

    return expect(hadChanges).to.be.true
  })

  after(() => {
    fs.rmSync(test_filename)
  })
})