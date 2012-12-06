module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: '<json:package.json>',
    test: {
      files: ['test/**/*.js']
    },
    lint: {
      files: ['grunt.js', '*.js', '**/*.js']
    },
    concat: {
      components: {
        src: [
          'components/jquery/jquery.js',
          'components/underscore/underscore.js',
          'components/jquery-ui/ui/minified/jquery-ui.min.js',
          'components/modernizr/modernizr.js'
          ],
        dest: 'public/build/javascripts/components.js'
      },
      site: {
        src: [
          'public/javascripts/a2-sandbox.js'
          ],
        dest: 'public/build/javascripts/site.js'
      }
    },
    compass: {
      dev: {
        src: 'public/stylesheets',
        dest: 'public/build/stylesheets',
        require: 'zurb-foundation',
        linecomments: true,
        forcecompile: true,
        debugsass: true,
        images: 'public/images',
        relativeassets: true
      }
    },
    watch: {
      files: ['public/**/*.js', "public/stylesheets/**/*.scss"],
      tasks: 'concat compass'
    },
    jshint: {
      options: {
        curly: true,
        eqeqeq: false, // This is annoying with the models
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        boss: true,
        eqnull: true,
        node: true,
        es5: true
      },
      globals: {
        exports: true
      }
    }
  });

  grunt.loadNpmTasks('grunt-contrib');
  grunt.loadNpmTasks('grunt-compass');

  // Default task.
  grunt.registerTask('default', 'lint concat compass test');
  grunt.registerTask('dev', 'concat compass');
};
