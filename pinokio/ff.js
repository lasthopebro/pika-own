module.exports = {
  daemon: true,
  run: [{
    method: "shell.run",
    params: {
      path: "..",
      message: "npx --yes web-ext run --source-dir . --ignore-files work/** tools/** test/** docs/** openspec/** inspiration/**"
    }
  }]
}

