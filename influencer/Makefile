LIB = dscc.min.js d3.v4.min.js
DEST = gs://codelab-looker/cluster

cluster.js: cluster-viz-src.js
	cat $(LIB) > $@
	echo >> $@
	cat $^ >> $@

deploy: cluster.css cluster.js cluster.json manifest.json
	gsutil cp -a public-read $^ $(DEST)

.PHONY:deploy
