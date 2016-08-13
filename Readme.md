# Hyper.sh Load Balancer

This is a load balancer for hyper.sh, that automatic reloads based on running containers.

## HTTP Example

First we need to start the load balancer:
Remember to change access and secret!
```
hyper run -d --name lb -e HYPER_ACCESS=$HYPER_ACCESS -e HYPER_SECRET=$HYPER_SECRET -p 80:80 kevinsimper/hyper-load-balancer
```

Note that the port we are opening is the one we need to also open on the containers we will load balanced to.

Next we attach a FIP to it

```
hyper attach $(hyper fip allocate 1) lb
```

Next we will start a Nginx container.

```
hyper run -d -e VIRTUAL_HOST=http://example.com -p 80:80 nginx
```

Now test it
```
curl -H 'Host: example.com' http://YOURFIP
```

# HTTPS Example

To run https you need to allocate an IP and point a domain to that ip.

Here in this example, have I allocated a FIP and pointed it at `hyper.kevinsimper.dk`

Remember to also change the email for Let's Encrypt, so that you can control the certificate later!

```
hyper run -it --name lb \
  -e HYPER_ACCESS=$HYPER_ACCESS \
  -e HYPER_SECRET=$HYPER_SECRET \
  -e LETSENCRYPT_EMAIL=kevin.simper@gmail.com \
  -p 80:80 -p 443:443 \
  kevinsimper/hyper-load-balancer
```

Remember to point the IP at the load balancer:

```
hyper attach $(hyper fip allocate 1) lb
```

Since we don't need https on the internal network we use port 80.

Caddy (the proxy webserver) works by "https default", so specifing a domain without `http` or `https`, makes it `https` by default.

```
$ hyper run -d -e VIRTUAL_HOST=hyper.kevinsimper.dk -p 80:80 nginx
```

Then we can test the TLS connection:

```
$ openssl s_client -showcerts -connect hyper.kevinsimper.dk:443
CONNECTED(00000003)
76101:error:1407742E:SSL routines:SSL23_GET_SERVER_HELLO:tlsv1 alert protocol version:/BuildRoot/Library/Caches/com.apple.xbs/Sources/OpenSSL098/OpenSSL098-59.60.1/src/ssl/s23_clnt.c:593:
```

And if you hit the non-https you get `HTTP/1.1 301 Moved Permanently` :+1::
```
$ curl -i hyper.kevinsimper.dk
HTTP/1.1 301 Moved Permanently
Location: https://hyper.kevinsimper.dk/
Server: Caddy
Date: Sat, 13 Aug 2016 20:19:45 GMT
Content-Length: 64
Content-Type: text/html; charset=utf-8

<a href="https://hyper.kevinsimper.dk/">Moved Permanently</a>.
```
