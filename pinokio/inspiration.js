module.exports = {
  run: [{
    method: "shell.run",
    params: {
      path: "..",
      message: "node tools/analyze_repo.mjs"
    }
  }]
}

