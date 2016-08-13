# Hyper.sh Load Balancer

This is a load balancer for hyper.sh, that automatic reloads based on running containers.

## Example

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
