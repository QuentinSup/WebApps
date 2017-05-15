interface Window {
    model: startupfollows.Model;
}
declare module startupfollows {
    class StartupAddForm {
        name: any;
        punchLine: any;
        email: any;
        firstName: any;
        lastName: any;
        image: any;
        website: any;
        twitter: any;
        facebook: any;
        members: any;
        nameExists: any;
        private __hdlCheckIfExists;
        constructor();
        checkIfExists(name: string): void;
        prev(): void;
        next(): void;
        addMember(): void;
        /**
         * Submit data
         */
        submit(): boolean;
    }
    class Model {
        form: StartupAddForm;
        constructor();
    }
}
