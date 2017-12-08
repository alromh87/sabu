'use strict'

const fs = require('fs')
const path = require('path')
const isBinaryFile = require('isbinaryfile')
const sizeToString = require('./size-to-string')
const permsToString = require('./perms-to-string')

const getCleanUrl = url => {
    // Remove trailing slash
    return (url.split('').pop() !== '/') ? url
        : url.substring(0, url.length - 1)
}

const getCleanPath = url => {
    
    let filePath = url
    
    // Remove trailing slash(es)
    while (filePath.substring(0, 1) === '/')
        filePath = filePath.substring(1)
    
    return filePath
    
}

const isBinary = (filePath, data) => new Promise((resolve, reject) => {
    
    fs.lstat(filePath, (err, stat) => {
        
        if (err) return reject(err)
        
        isBinaryFile(data, stat.size, (err, result) =>
            err ? reject(err) : resolve(!result))
        
    })
    
})

const sendFile = (res, filePath) => {
    
    fs.stat(filePath, (err, stats) => {
        
        if (err) {
            console.error(err)
            return res.send(404, { error: 'File not found' })
        }
        
        res.header('Content-Type', mime.lookup(filePath))
        fs.createReadStream(filePath).pipe(res)
        res.once('result', err => {
            if (err) return res.send(500, { error: err })
        })
        
    })
    
}

const directoryListing = dir => {
    
    dir = path.dirname(dir)
    
    return fs.readdirSync(dir, 'utf8')
        .map(x => {
            
            const stat = fs.statSync(path.resolve(dir, x))
            const size = sizeToString(stat, true, false)
            const perms = permsToString(stat)
            
            return `
                 <tr>
                    <td>@todo icon</td>
                    <td>${perms}</td>
                    <td>${size}</td>
                    <td>${x}</td>
                `
        })
        .join('\n')
    
}

module.exports.getCleanUrl = getCleanUrl
module.exports.getCleanPath = getCleanPath
module.exports.isBinary = isBinary
module.exports.sendFile = sendFile
module.exports.directoryListing = directoryListing
