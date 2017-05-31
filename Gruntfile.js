module.exports = function (grunt) {

	grunt.initConfig({

		// Import package manifest
		pkg: grunt.file.readJSON("package.json"),

		// Banner definitions
		meta: {
			banner: "/*\n" +
				" *  <%= pkg.title || pkg.name %> - v<%= pkg.version %>\n" +
				" *  <%= pkg.description %>\n" +
				" *  <%= pkg.homepage %>\n" +
				" *\n" +
				" *  Made by <%= pkg.author.name %>\n" +
				" *  Under <%= pkg.license %> License\n" +
				" */\n"
		},

		// Concat definitions
		concat: {
			options: {
				banner: "<%= meta.banner %>"
			},
			dist: {
				src: ["src/<%=  pkg.name %>.js"],
				dest: "dist/<%=  pkg.name %>.js"
			}
		},

		//Concat css definitions
		concat_css: {
			options: {},
			all: {
				src: ["src/*.css"],
				dest: "dist/<%=  pkg.name %>.css"
			},
		},

		// Lint definitions
		jshint: {
			files: ["src/<%=  pkg.name %>.js", "test/**/*"],
			options: {
				jshintrc: ".jshintrc"
			}
		},

		jscs: {
			src: "src/**/*.js",
			options: {
				config: ".jscsrc"
			}
		},

		// Minify definitions
		uglify: {
			dist: {
				src: ["dist/<%=  pkg.name %>.js"],
				dest: "dist/<%=  pkg.name %>.min.js"
			},
			options: {
				banner: "<%= meta.banner %>"
			}
		},

		// Minify css
		cssmin: {
			target: {
				files: [{
					expand: true,
					cwd: 'src',
					src: ['*.css', '!*.min.css'],
					dest: 'dist',
					ext: '.min.css'
				}]
			}
		},

		// CoffeeScript compilation
		coffee: {
			compile: {
				files: {
					"dist/<%=  pkg.name %>.js": "src/<%=  pkg.name %>.coffee"
				}
			}
		},

		// karma test runner
		karma: {
			unit: {
				configFile: "karma.conf.js",
				background: true,
				singleRun: false,
				browsers: ["Chrome", "Firefox"]
			},

			//continuous integration mode: run tests once in PhantomJS browser.
			travis: {
				configFile: "karma.conf.js",
				singleRun: true,
				browsers: ["Chrome"]
			}
		},

		// watch for changes to source
		// Better than calling grunt a million times
		// (call 'grunt watch')
		watch: {
			default: {
				files: ["src/*", "test/**/*"],
				tasks: ["default"],
			},
			build: {
				files: ["src/*", "test/**/*"],
				tasks: ["buildFull"],
			}
		}

	});

	grunt.loadNpmTasks("grunt-contrib-concat");
	grunt.loadNpmTasks("grunt-contrib-jshint");
	grunt.loadNpmTasks("grunt-jscs");
	grunt.loadNpmTasks("grunt-contrib-uglify");
	grunt.loadNpmTasks("grunt-contrib-coffee");
	grunt.loadNpmTasks("grunt-contrib-watch");
	grunt.loadNpmTasks("grunt-karma");
	grunt.loadNpmTasks("grunt-contrib-cssmin");
	grunt.loadNpmTasks('grunt-concat-css');

	grunt.registerTask("travis", ["jshint", "karma:travis"]);
	grunt.registerTask("lint", ["jshint", "jscs"]);
	grunt.registerTask("build", ["concat", "uglify", "concat_css", "cssmin"]);
	grunt.registerTask("default", ["jshint", "build", "karma:unit:run"]);
	grunt.registerTask("buildFull", ["jshint", "build"]);
	grunt.registerTask("watchKarma", ["karma:unit:start", "watch"]);
	grunt.registerTask("watchBuild", ["watch:build"]);
};
