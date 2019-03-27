const express = require('express');
const helmet = require('helmet');
const knex = require('knex');

const knexConfig = {
    client: 'sqlite3',
    connection: {
      filename: './data/lambda.sqlite3',
    },
    useNullAsDefault: true, // needed for sqlite
  };


  const server = express();

  server.use(helmet());
  server.use(express.json());

  const db = knex(knexConfig);

  //users = cohorts
  //posts = students

  server.post('/api/cohorts', (req, res) => {
      db('cohorts')
        .insert(req.body)
        .then(ids => {
            const id = ids[0];
            db('cohorts')
                .where({ id })
                .first()
                .then(cohort => {
                    res.status(201).json(cohort);
                })
                .catch(err => {
                    res.status(500).json(err)
                })
        })
  })

  server.get('/api/cohorts', (req, res) => {
      db('cohorts')
        .then(cohorts => {
            res.status(200).json(cohorts);
        })
        .catch(error => {
            res.status(500).json(error);
        })
  })

  server.get('/api/cohorts/:id', (req, res) => {
      const cohortId = req.params.id;

    db('cohorts')
        .where({ id: cohortId })
        .first()
        .then(cohort => {
            if (cohort) {
                res.status(200).json(cohort);
            } else {
                res.status(404).json({message: 'Cohort not found' })
            }
      })
      .catch(error => {
          res.status(500).json(error);
      })
})


// function getCohortStudents(cohortId) {
//     return db('students as s')
//       .join('cohorts as c', 'c.id', 's.cohort_id')
//       .select('s.id', 's.name', 'c.name as cohort')
//       .where('s.cohort_id', cohortId);
//   }

//   function getCohortStudents(cohortId) {
//     return db('cohorts')
//     .join('cohorts', 'cohorts.id', 'students.cohort_id')
//     .select('students.id', 'students.name', 'cohorts.name')
//     .where('students.cohort_id', cohortId)
//   }

server.get('/api/cohorts/:id/students', (req, res) => {
    const cohortId = req.params.id;

    db('students')
        .join('cohorts', 'cohorts.id', 'students.cohort_id')
        .select('students.id', 'students.name', 'cohorts.name')
        .where('students.cohort_id', cohortId)
        .then(cohortStudents => {
            if (cohortStudents.length === 0) {
                res
                .status(404)
                .json({ error: 'There are no students in this cohort'})
            } else {
                res 
                .status(200)
                .json(cohortStudents);
            }
        })
        .catch(error => {
            res
                .status(500)
                .json({ error: "Something terrible happened"})
        });
    });

server.delete('/api/cohorts/:id', (req, res) => {
    db('cohorts')
        .where({ id: req.params.id })
        .del()
        .then(count => {
        if (count > 0 ) {
            res.status(204).end();
        } else {
            res.status(404).json({ message: 'Cohort not found' });
        }
        })
        .catch(error => {
            res.status(500).json(error);
        })
});

server.put('/api/cohorts/:id', (req, res) => {
    db ('cohorts')
        .where ({ id: req.params.id })
        .update(req.body)
        .then(count => {
        if (count > 0) {
            db('cohorts')
                .where({ id: req.params.id })
                .first();

                res.status(200).json(count);
        } else {
            res.status(404).json({ message: 'Cohort not found' })
        }
    })
        .catch(error => {
            res.status(500).json(error);
        })
})



  const port = process.env.PORT || 5000;
  server.listen(port, () =>
    console.log(`\n** API running on http://localhost:${port} **\n`)
  );