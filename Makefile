HTTPSERVE	 	?= ./node_modules/.bin/http-server
HTTPSERVE_PORT	?= 8001
LERNA			?= ./node_modules/.bin/lerna

.PHONY: help
help:
	@echo "Please use \`make <target>' where <target> is one of the following:"
	@echo ""
	@echo " serve       	Serve this directory via a webserver on port 8001."
	@echo " node_modules	Install NPM dependencies"

node_modules: $(LERNA) package.json package-lock.json
	npm run lerna

.PHONY: serve
serve: node_modules
	$(HTTPSERVE) -p $(HTTPSERVE_PORT) -c-1
