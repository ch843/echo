class User
{
    constructor(username, password, fname, lname, email)
    {
        this.username = username;
        this.password = password;
        this.firstname = fname;
        this.lastname = lname;
        this.email = email;
    }
}

class Entry extends User
{
    constructor(date, prompt1, prompt2, prompt3)
    {

        super(username);

        this.date = date;
        this.prompt1 = prompt1;
        this.prompt2 = prompt2;
        this.prompt3 = prompt3;

        this.username = username;
    }
}