import aws4 from 'hyper-aws4'
import fetch from 'node-fetch'

const signOption = {
  url: 'https://us-west-1.hyper.sh/containers/json',
  method: 'GET',
  credential: {
    accessKey: process.env.HYPER_ACCESS,
    secretKey: process.env.HYPER_SECRET
  }
}

const headers = aws4.sign(signOption)
fetch(signOption.url, {method: signOption.method, headers}).then(function(res) {
    return res.json();
}).then(function(json) {
    console.log(json);
});
