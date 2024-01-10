import DataSource from "./DataSource";
import app from './app';

DataSource.initialize().then(() => {
    console.log('connected to database');
});

app.listen(3630, () => {
    console.log('started server on port 3630');
});