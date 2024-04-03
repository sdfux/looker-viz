LIB = dscc.min.js d3.v5.min.js d3.layout.cloud.js d3-interpolate@3 
DEST = gs://codelab-looker/wordcloudD3
viz.js: viz-src.js
	cat $(LIB) > $@
	echo >> $@
	cat $^ >> $@

deploy: viz.css viz.js viz.json manifest.json
	gsutil cp -a public-read $^ $(DEST)

.PHONY:deploy
