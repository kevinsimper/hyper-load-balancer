import aws4 from 'hyper-aws4'
import fetch from 'node-fetch'
import Promise from 'bluebird'
import fs from 'fs'

const signOption = {
  method: 'GET',
  credential: {
    accessKey: process.env.HYPER_ACCESS,
    secretKey: process.env.HYPER_SECRET
  }
}

let output = {
  websites: []
}

let url = 'https://us-west-1.hyper.sh/containers/json'
const headers = aws4.sign(Object.assign({}, {url}, signOption))
let containers = fetch(url, {method: signOption.method, headers}).then((res) => {
    return res.json()
})

let containersInfo = containers.then((containers_) => {
    return Promise.all(containers_.map(con => {
      let url = `https://us-west-1.hyper.sh/containers/${con.Id}/json`
      const headers = aws4.sign(Object.assign({}, {url}, signOption))
      return fetch(url, {method: signOption.method, headers}).then((res) => {
          return res.json()
      })
    }))
})

Promise.all([containers, containersInfo]).spread((cons, infos) => {
  infos.map((info, i) => {

    let virtualHost = info.Config.Env.find((item) => {
      return item.indexOf('VIRTUAL_HOST') > -1
    })

    if(virtualHost !== undefined) {
      virtualHost = virtualHost.replace('VIRTUAL_HOST=','')
      let fip = info.Config.Labels['sh.hyper.fip']
      let internalIp = info.NetworkSettings.IPAddress
      let choosenIp = (fip) ? fip : internalIp
      let port = cons[i].Ports[0].PublicPort
      let alreadyDefined = output.websites.find(web => web.url === virtualHost)

      if (alreadyDefined !== undefined) {
        alreadyDefined.backends.push(choosenIp + ':' + port)
      } else {
        output.websites.push({
          url: virtualHost,
          backends: [choosenIp + ':' + port]
        })
      }
    }
  })

  let jsonOutput = JSON.stringify(output, null, 2)
  console.log('Final output:', jsonOutput)
  fs.writeFileSync('./info.json', jsonOutput)
}).catch((e) => {console.log(e)})
