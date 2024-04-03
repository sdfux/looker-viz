LIB = dscc.min.js
DEST = gs://codelab-looker/cards
viz.js: viz-src.js
	cat $(LIB) > $@
	echo >> $@
	cat $^ >> $@

deploy: viz.css viz.js viz.json manifest.json
	gsutil cp -a public-read $^ $(DEST)

.PHONY:deploy
